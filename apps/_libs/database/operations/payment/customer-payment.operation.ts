import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { formatNumber } from '../../../common/helpers/string.helper'
import {
  MoneyDirection,
  PaymentInsertType,
  PaymentTiming,
  PersonType,
  VoucherType,
} from '../../entities/payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, PaymentManager } from '../../managers'

@Injectable()
export class CustomerPaymentOperation {
  constructor(
    private dataSource: DataSource,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager
  ) { }

  async startPayment(options: {
    oid: number
    customerId: number
    paymentMethodId: number
    money: number
    time: number
    cashierId: number
    ticketPaymentList: { ticketId: number; money: number }[]
    note?: string
  }) {
    const { oid, customerId, paymentMethodId, ticketPaymentList, money, time, note, cashierId } =
      options
    const PREFIX = `customerId=${customerId} payment failed`

    const totalTicketMoney = ticketPaymentList.reduce((acc, cur) => {
      if (cur.money <= 0) {
        throw new Error(`${PREFIX}: Money number invalid`)
      }
      return acc + cur.money
    }, 0)
    const moneyRemain = money - totalTicketMoney

    if (totalTicketMoney < 0 || money <= 0 || money < totalTicketMoney) {
      throw new Error(`${PREFIX}: Money number invalid`)
    }
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE CUSTOMER ===
      const customerModified = await this.customerManager.updateOneAndReturnEntity(
        manager,
        { oid, id: customerId },
        { debt: () => `debt - ${money}` }
      )

      const customerCloseDebt = customerModified.debt
      let customerOpenDebt = customerCloseDebt + money

      const paymentInsertList: PaymentInsertType[] = []
      let description = ``
      if (ticketPaymentList.length) {
        description =
          `Thanh toán ${formatNumber(money)} vào các phiếu nợ::`
          + `${ticketPaymentList.map((i) => i.ticketId + '').join(',')}`
      }
      if (moneyRemain > 0) {
        description += ` - Cộng quỹ`
      }
      // === 3. UPDATE VISIT ===
      if (ticketPaymentList.length) {
        const ticketUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "Ticket" ticket
          SET "paid"            = ticket."paid" + temp."money",
              "debt"            = ticket."debt" - temp."money",
              "status"    = CASE 
                                    WHEN(ticket."debt" = temp."money") 
                                        THEN ${TicketStatus.Completed} 
                                    ELSE ${TicketStatus.Debt}
                                  END
          FROM (VALUES `
          + ticketPaymentList.map((i) => `(${i.ticketId}, ${i.money})`).join(', ')
          + `   ) AS temp("ticketId", "money")
          WHERE   ticket."oid"          = ${oid} 
              AND ticket."id"           = temp."ticketId" 
              AND ticket."customerId"   = ${customerId}
              AND ticket."status" = ${TicketStatus.Debt}
              AND ticket."debt"         >= temp."money";
          `
        )
        if (ticketUpdateResult[1] != ticketPaymentList.length) {
          throw new Error(`${PREFIX}: Update Ticket failed, affected = ${ticketUpdateResult[1]}`)
        }

        ticketPaymentList.forEach((i) => {
          const paymentInsert: PaymentInsertType = {
            oid,
            paymentMethodId,
            voucherType: VoucherType.Ticket,
            voucherId: i.ticketId,
            personType: PersonType.Customer,
            personId: customerId,
            paymentTiming: PaymentTiming.PayDebt,
            createdAt: time,
            moneyDirection: MoneyDirection.In,
            paidAmount: i.money,
            debtAmount: -i.money,
            openDebt: customerOpenDebt,
            closeDebt: customerOpenDebt - i.money,
            cashierId,
            note: note || '',
            description,
          }
          customerOpenDebt = paymentInsert.closeDebt
          paymentInsertList.push(paymentInsert)
        })
      }

      if (moneyRemain > 0) {
        const paymentInsert: PaymentInsertType = {
          oid,
          paymentMethodId,
          voucherType: VoucherType.Unknown,
          voucherId: 0,
          personType: PersonType.Customer,
          personId: customerId,
          paymentTiming: PaymentTiming.TopUp,
          createdAt: time,
          moneyDirection: MoneyDirection.In,
          paidAmount: moneyRemain,
          debtAmount: -moneyRemain,
          openDebt: customerOpenDebt,
          closeDebt: customerOpenDebt - moneyRemain,
          cashierId,
          note: note || '',
          description,
        }
        paymentInsertList.push(paymentInsert)
      }

      const paymentCreatedList = await this.paymentManager.insertManyAndReturnEntity(
        manager,
        paymentInsertList
      )

      return { customer: customerModified }
    })
  }
}
