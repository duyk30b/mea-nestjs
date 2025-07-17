import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { formatNumber } from '../../../common/helpers/string.helper'
import { BusinessError } from '../../common/error'
import { Customer } from '../../entities'
import {
  MoneyDirection,
  PaymentInsertType,
  PaymentTiming,
  PersonType,
  VoucherType,
} from '../../entities/payment.entity'
import Ticket, { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, PaymentManager, TicketManager } from '../../managers'

@Injectable()
export class CustomerPaymentOperation {
  constructor(
    private dataSource: DataSource,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager,
    private ticketManager: TicketManager
  ) { }

  async paymentCommon(options: {
    oid: number
    customerId: number
    paymentMethodId: number
    time: number
    cashierId: number
    paymentData: {
      payDebtTicketList: { ticketId: number; money: number }[]
      prepaymentTicketList: { ticketId: number; money: number }[]
      moneyTopUp: number
    }
    note?: string
  }) {
    const { oid, customerId, paymentMethodId, paymentData, time, note, cashierId } = options
    const PREFIX = `customerId=${customerId} payment failed`

    try {
      return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
        // === 1. UPDATE CUSTOMER ===
        const moneyPayDebt = paymentData.payDebtTicketList.reduce(
          (acc, item) => acc + item.money,
          0
        )
        const moneyPrepayment = paymentData.prepaymentTicketList.reduce(
          (acc, item) => acc + item.money,
          0
        )
        const moneyForSub = moneyPayDebt + paymentData.moneyTopUp

        let customer: Customer

        if (moneyForSub != 0) {
          customer = await this.customerManager.updateOneAndReturnEntity(
            manager,
            { oid, id: customerId },
            { debt: () => `debt - ${moneyForSub}` }
          )
        } else {
          customer = await this.customerManager.findOneBy(manager, { id: customerId })
        }

        const customerCloseDebt = customer.debt
        let customerOpenDebt = customerCloseDebt + moneyForSub

        const paymentInsertList: PaymentInsertType[] = []
        const descriptionList: string[] = []
        if (paymentData.payDebtTicketList.length) {
          descriptionList.push(
            `Trả nợ ${formatNumber(moneyPayDebt)} vào phiếu:`
            + `${paymentData.payDebtTicketList.map((i) => i.ticketId + '').join(',')}`
          )
        }
        if (paymentData.prepaymentTicketList.length > 0) {
          descriptionList.push(
            ` - Tạm ứng ${formatNumber(moneyPrepayment)} vào phiếu:`
            + `${paymentData.prepaymentTicketList.map((i) => i.ticketId + '').join(',')}`
          )
        }
        if (paymentData.moneyTopUp > 0) {
          descriptionList.push(` - Cộng quỹ ${formatNumber(paymentData.moneyTopUp)}`)
        }

        const ticketModifiedList: Ticket[] = []
        if (paymentData.payDebtTicketList.length) {
          const ticketUpdatedList = await this.ticketManager.bulkUpdate({
            manager,
            tempList: paymentData.payDebtTicketList.map((i) => ({
              id: i.ticketId,
              money: i.money,
            })),
            condition: {
              oid,
              customerId,
              status: TicketStatus.Debt,
              debt: { RAW_QUERY: '"debt" >= temp."money"' },
            },
            compare: ['id'],
            update: {
              paid: (t) => `paid + ${t}.money`,
              debt: (t) => `debt - ${t}.money`,
              status: (t: string, u: string) => ` CASE
                                    WHEN("${u}"."debt" = ${t}."money") THEN ${TicketStatus.Completed} 
                                    ELSE ${TicketStatus.Debt}
                                  END`,
            },
            options: { requireEqualLength: true },
          })
          ticketModifiedList.push(...ticketUpdatedList)

          paymentData.payDebtTicketList.forEach((i) => {
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
              description: descriptionList.length > 1 ? descriptionList.join(', ') : '',
            }
            customerOpenDebt = paymentInsert.closeDebt
            paymentInsertList.push(paymentInsert)
          })
        }

        if (paymentData.prepaymentTicketList.length) {
          const ticketUpdatedList = await this.ticketManager.bulkUpdate({
            manager,
            tempList: paymentData.prepaymentTicketList.map((i) => ({
              id: i.ticketId,
              money: i.money,
            })),
            condition: {
              oid,
              customerId,
              status: {
                IN: [
                  TicketStatus.Draft,
                  TicketStatus.Schedule,
                  TicketStatus.Deposited,
                  TicketStatus.Executing,
                ],
              },
            },
            compare: ['id'],
            update: {
              paid: (t) => `paid + ${t}.money`,
              debt: (t) => `debt - ${t}.money`,
              status: (t: string, u: string) => ` CASE
                                    WHEN("${u}"."status" = ${TicketStatus.Draft}) THEN ${TicketStatus.Deposited} 
                                    WHEN("${u}"."status" = ${TicketStatus.Schedule}) THEN ${TicketStatus.Deposited} 
                                    WHEN("${u}"."status" = ${TicketStatus.Deposited}) THEN ${TicketStatus.Deposited} 
                                    ELSE ${TicketStatus.Executing}
                                  END`,
            },
            options: { requireEqualLength: true },
          })
          ticketModifiedList.push(...ticketUpdatedList)

          paymentData.prepaymentTicketList.forEach((i) => {
            const paymentInsert: PaymentInsertType = {
              oid,
              paymentMethodId,
              voucherType: VoucherType.Ticket,
              voucherId: i.ticketId,
              personType: PersonType.Customer,
              personId: customerId,
              paymentTiming: PaymentTiming.Prepayment,
              createdAt: time,
              moneyDirection: MoneyDirection.In,
              paidAmount: i.money,
              debtAmount: 0,
              openDebt: customerCloseDebt,
              closeDebt: customerCloseDebt,
              cashierId,
              note: note || '',
              description: descriptionList.length > 1 ? descriptionList.join(', ') : '',
            }
            paymentInsertList.push(paymentInsert)
          })
        }

        if (paymentData.moneyTopUp > 0) {
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
            paidAmount: paymentData.moneyTopUp,
            debtAmount: -paymentData.moneyTopUp,
            openDebt: customerCloseDebt + paymentData.moneyTopUp,
            closeDebt: customerCloseDebt,
            cashierId,
            note: note || '',
            description: descriptionList.length > 1 ? descriptionList.join(', ') : '',
          }
          paymentInsertList.push(paymentInsert)
        }

        const paymentCreatedList = await this.paymentManager.insertManyAndReturnEntity(
          manager,
          paymentInsertList
        )

        return { customer, ticketModifiedList, paymentCreatedList }
      })
    } catch (error) {
      console.log(' CustomerPaymentOperation ~ error:', error)
      throw new BusinessError(error.message)
    }
  }

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

    try {
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
    } catch (error) {
      console.log('CustomerPaymentOperation ~ error:', error)
      throw new BusinessError(error.message)
    }
  }
}
