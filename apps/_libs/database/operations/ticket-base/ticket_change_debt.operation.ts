import { BusinessError } from '@libs/database/common/error'
import { DiscountType, TicketActionType } from '@libs/database/common/variable'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
} from '@libs/database/entities/payment.entity'
import {
  PaymentTicketInsertType,
  PaymentTicketItemType,
} from '@libs/database/entities/payment_ticket.entity'
import { TicketStatus } from '@libs/database/entities/ticket.entity'
import {
  CustomerRepository,
  PaymentRepository,
  PaymentTicketRepository,
  TicketRepository,
  WalletRepository,
} from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

@Injectable()
export class TicketChangeDebtOperation {
  constructor(
    private dataSource: DataSource,
    private customerRepository: CustomerRepository,
    private walletRepository: WalletRepository,
    private ticketRepository: TicketRepository,
    private paymentRepository: PaymentRepository,
    private paymentTicketRepository: PaymentTicketRepository
  ) {}

  async startChangeDebt(props: {
    oid: number
    customerId: number
    paymentActionType: PaymentActionType
    changeDebtList: {
      ticketId: string
      ticketActionType: TicketActionType
      paid: number
      debt: number
    }[]
    cashierId: number
    walletId: string
    time: number
    note: string
  }) {
    // Chỉ 1 trong 2 trường hợp được phép xảy ra: (debt luôn != 0)
    // Nếu paid + debt = 0 => thanh toán nợ
    // Nếu paid = 0 => điều chỉnh nợ (ví dụ đóng phiếu, mở lại phiếu)
    const { oid, customerId, cashierId, walletId, time, note, paymentActionType, changeDebtList } =
      props
    const PREFIX = `customerId=${customerId} change debt failed`

    const paidTotal = changeDebtList.reduce((acc, cur) => {
      if (cur.paid != 0 && cur.debt + cur.paid != 0) {
        throw new Error(`${PREFIX}: Paid number invalid`)
      }
      return acc + cur.paid
    }, 0)
    const debtTotal = changeDebtList.reduce((acc, cur) => {
      if (cur.debt == 0) {
        throw new Error(`${PREFIX}: Debt number must not be 0`)
      }
      return acc + cur.debt
    }, 0)

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE CUSTOMER ===
      const customerModified = await this.customerRepository.managerUpdateOne(
        manager,
        { oid, id: customerId },
        { debt: () => `debt + ${debtTotal}` }
      )

      const customerCloseDebt = customerModified.debt
      const customerOpenDebt = customerCloseDebt - debtTotal

      let walletOpenMoney = 0
      let walletCloseMoney = 0
      if (paidTotal != 0) {
        if (walletId && walletId !== '0') {
          const walletModified = await this.walletRepository.managerUpdateOne(
            manager,
            { oid, id: walletId },
            { money: () => `money + ${paidTotal}` }
          )
          walletCloseMoney = walletModified.money
          walletOpenMoney = walletModified.money - paidTotal
        } else {
          // validate wallet
          const walletList = await this.walletRepository.managerFindManyBy(manager, { oid })
          if (walletList.length) {
            throw new BusinessError(PREFIX, 'Chưa chọn phương thức thanh toán')
          }
        }
      }

      const ticketModifiedList = await this.ticketRepository.managerBulkUpdate({
        manager,
        condition: {
          oid,
          customerId,
          status: { NOT_IN: [TicketStatus.Completed, TicketStatus.Cancelled] },
        },
        compare: { id: { cast: 'bigint' } },
        tempList: changeDebtList.map((i) => ({
          id: i.ticketId,
          paid: i.paid,
          debt: i.debt,
        })),
        update: {
          paidTotal: (t: string, u: string) => `"${u}"."paidTotal" + "${t}"."paid"`,
          debtTotal: (t: string, u: string) => `"${u}"."debtTotal" + "${t}"."debt"`,
          status: (t: string, u: string) => `CASE 
                      WHEN("status" = ${TicketStatus.Debt} 
                          AND "${u}"."debtTotal" + "${t}"."debt" = 0
                          AND "${u}"."paidTotal" + "${t}"."paid" = "${u}"."totalMoney") 
                        THEN ${TicketStatus.Completed} 
                      ELSE "status"
                    END`,
        },
        options: { requireEqualLength: true },
      })

      ticketModifiedList.forEach((ticketModified) => {
        if (ticketModified.debtTotal < 0 || ticketModified.debtTotal > ticketModified.totalMoney) {
          throw new BusinessError(PREFIX, 'Số tiền nợ không đúng', { ticketId: ticketModified.id })
        }
      })

      const paymentInsert: PaymentInsertType = {
        oid,
        personType: PaymentPersonType.Customer,
        personId: customerId,

        cashierId,
        walletId: walletId || '0',
        paymentActionType,
        moneyDirection: paidTotal > 0 ? MoneyDirection.In : MoneyDirection.Other,
        note,
        createdAt: time,

        paidTotal,
        debtTotal,
        personOpenDebt: customerOpenDebt,
        personCloseDebt: customerCloseDebt,
        walletOpenMoney,
        walletCloseMoney,
      }
      const paymentCreated = await this.paymentRepository.managerInsertOne(manager, paymentInsert)

      const paymentTicketInsertList = changeDebtList.map((i) => {
        const inserter: PaymentTicketInsertType = {
          oid,
          paymentId: paymentCreated.id,
          ticketId: i.ticketId,
          paymentTicketItemType: PaymentTicketItemType.Unknown,
          ticketActionType: i.ticketActionType,
          ticketItemId: '0',
          ticketItemInteractId: 0,
          sessionIndex: 0,

          expectedPrice: 0,
          discountType: DiscountType.Percent,
          discountMoney: 0,
          discountPercent: 0,
          actualPrice: 0,
          quantity: 1,
          unitRate: 1,
          paidMoney: i.paid,
          debtMoney: i.debt,
          createdAt: time,
        }
        return inserter
      })

      const paymentTicketCreatedList = await this.paymentTicketRepository.managerInsertMany(
        manager,
        paymentTicketInsertList
      )

      paymentTicketCreatedList.forEach((i) => {
        i.payment = paymentCreated
      })

      return { customerModified, ticketModifiedList, paymentTicketCreatedList }
    })

    return transaction
  }
}
