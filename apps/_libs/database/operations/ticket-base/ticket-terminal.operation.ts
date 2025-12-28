import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../common/error'
import { Customer } from '../../entities'
import Payment, {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../entities/payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  CustomerRepository,
  PaymentRepository,
  TicketRepository,
  WalletRepository,
} from '../../repositories'

@Injectable()
export class TicketTerminalOperation {
  constructor(
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private customerRepository: CustomerRepository,
    private walletRepository: WalletRepository,
    private paymentRepository: PaymentRepository
  ) { }

  async startTerminal(props: {
    oid: number
    ticketId: string
    walletId: string
    time: number
    note: string
    userId: number
  }) {
    const { oid, ticketId, userId, time, note } = props
    const walletId = props.walletId || '0'

    const PREFIX = `ticketId=${ticketId} startTerminal failed`

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction('READ UNCOMMITTED')
    try {
      const manager = queryRunner.manager
      // === 1. TICKET: Update status để tạo transaction ===
      const ticketOrigin = await this.ticketRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: ticketId,
          status: {
            IN: [
              TicketStatus.Draft,
              TicketStatus.Schedule,
              TicketStatus.Deposited,
              TicketStatus.Executing,
            ],
          },
        },
        {
          updatedAt: time,
          endedAt: null,
          status: TicketStatus.Cancelled,
        }
      )

      let ticketModified = ticketOrigin
      let customerModified: Customer
      let paymentCreated: Payment

      if (ticketOrigin.paidTotal !== 0 || ticketOrigin.debtTotal !== 0) {
        if (ticketOrigin.isPaymentEachItem) {
          throw new BusinessError('Cần hủy thanh toán trước khi hủy phiếu')
        }
        const { customerId } = ticketOrigin
        let walletOpenMoney = 0
        let walletCloseMoney = 0

        if (ticketOrigin.debtTotal !== 0) {
          customerModified = await this.customerRepository.managerUpdateOne(
            manager,
            { oid, id: customerId },
            { updatedAt: Date.now(), debt: () => `debt - ${ticketOrigin.debtTotal}` }
          )
        } else {
          customerModified = await this.customerRepository.managerFindOneBy(manager, {
            oid,
            id: customerId,
          })
        }

        if (ticketOrigin.paidTotal !== 0) {
          if (walletId && walletId !== '0') {
            const walletModified = await this.walletRepository.managerUpdateOne(
              manager,
              { oid, id: walletId },
              { money: () => `money - ${ticketOrigin.paidTotal}` }
            )
            walletCloseMoney = walletModified.money
            walletOpenMoney = walletModified.money + ticketOrigin.paidTotal
          } else {
            // validate wallet
            const walletList = await this.walletRepository.managerFindManyBy(manager, { oid })
            if (walletList.length) {
              throw new BusinessError(PREFIX, 'Chưa chọn phương thức thanh toán')
            }
          }
        }

        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.Ticket,
          voucherId: ticketId,
          personType: PaymentPersonType.Customer,
          personId: customerId,

          cashierId: userId,
          walletId: ticketOrigin.paidTotal !== 0 ? walletId : '0',
          createdAt: time,
          paymentActionType: PaymentActionType.Terminal,
          moneyDirection: ticketOrigin.paidTotal !== 0 ? MoneyDirection.Out : MoneyDirection.Other,
          note,

          hasPaymentItem: ticketOrigin.isPaymentEachItem,
          paidTotal: -ticketOrigin.paidTotal,
          debtTotal: -ticketOrigin.debtTotal,
          personOpenDebt: customerModified.debt + ticketOrigin.debtTotal,
          personCloseDebt: customerModified.debt,
          walletOpenMoney,
          walletCloseMoney,
        }

        paymentCreated = await this.paymentRepository.managerInsertOne(manager, paymentInsert)

        ticketModified = await this.ticketRepository.managerUpdateOne(
          manager,
          { oid, id: ticketId },
          { paidTotal: 0, debtTotal: 0 }
        )
      }

      await queryRunner.commitTransaction()

      return {
        ticketModified,
        customerModified,
        paymentCreated,
      }
    } catch (error) {
      console.error('error:', error)
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
