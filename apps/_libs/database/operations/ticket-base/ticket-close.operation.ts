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
export class TicketCloseOperation {
  constructor(
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private customerRepository: CustomerRepository,
    private walletRepository: WalletRepository,
    private paymentRepository: PaymentRepository
  ) { }

  async startClose(params: { oid: number; ticketId: string; userId: number; time: number }) {
    const { oid, ticketId, userId, time } = params

    const PREFIX = `ticketId=${ticketId} close failed`

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction('READ UNCOMMITTED')
    try {
      const manager = queryRunner.manager
      // === 1. TICKET: Update status để tạo transaction ===
      const ticketUpdated = await this.ticketRepository.managerUpdateOne(
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
          status: () => `CASE 
                              WHEN("paidTotal" < "totalMoney") THEN ${TicketStatus.Debt} 
                              WHEN("paidTotal" = "totalMoney") THEN ${TicketStatus.Completed} 
                              ELSE ${TicketStatus.Executing}
                          END
                          `,
          updatedAt: time,
          endedAt: time,
        }
      )

      if (ticketUpdated.paidTotal - ticketUpdated.debtTotal > ticketUpdated.totalMoney) {
        throw new BusinessError(PREFIX, 'Cần hoàn trả tiền thừa trước khi đóng phiếu')
      }

      const { customerId } = ticketUpdated
      let ticketModified = ticketUpdated
      let customerModified: Customer
      let paymentCreated: Payment

      const debtFix =
        ticketModified.totalMoney - (ticketModified.paidTotal + ticketModified.debtTotal)
      if (ticketUpdated.isPaymentEachItem) {
        if (debtFix !== 0) {
          // Trường hợp thanh toán lẻ không fix được
          throw new BusinessError(PREFIX, 'Chưa thanh toán đủ')
        }
      }
      // debtFix > 0: ghi nợ
      // debtFix cũng có thể < 0, khi đã thanh toán quá số tiền (===> thành trừ nợ)
      if (debtFix) {
        ticketModified = await this.ticketRepository.managerUpdateOne(
          manager,
          { oid, id: ticketId },
          { debtTotal: ticketUpdated.debtTotal + debtFix }
        )
        customerModified = await this.customerRepository.managerUpdateOne(
          manager,
          { oid, id: customerId },
          { updatedAt: Date.now(), debt: () => `debt + ${debtFix}` }
        )

        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.Ticket,
          voucherId: ticketId,
          personType: PaymentPersonType.Customer,
          personId: customerId,

          cashierId: userId,
          walletId: '0',
          createdAt: time,
          paymentActionType: PaymentActionType.Close,
          moneyDirection: MoneyDirection.Other,
          note: '',

          hasPaymentItem: ticketUpdated.isPaymentEachItem,
          paidTotal: 0,
          debtTotal: debtFix,
          personOpenDebt: customerModified.debt - debtFix,
          personCloseDebt: customerModified.debt,
          walletOpenMoney: 0,
          walletCloseMoney: 0,
        }

        paymentCreated = await this.paymentRepository.managerInsertOne(manager, paymentInsert)
      }

      await queryRunner.commitTransaction()

      return {
        ticketModified,
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
