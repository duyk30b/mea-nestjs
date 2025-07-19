import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../common/error'
import {
  MoneyDirection,
  PaymentItemInsertType,
  PaymentVoucherItemType,
  PaymentVoucherTiming,
  PaymentVoucherType,
} from '../../entities/payment-item.entity'
import { PaymentInsertType, PaymentPersonType } from '../../entities/payment.entity'
import Ticket, { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, TicketManager } from '../../managers'
import { PaymentItemManager, PaymentManager } from '../../repositories'

@Injectable()
export class CustomerPaymentOperation {
  constructor(
    private dataSource: DataSource,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager,
    private paymentItemManager: PaymentItemManager,
    private ticketManager: TicketManager
  ) { }

  async startPayment(options: {
    oid: number
    customerId: number
    cashierId: number
    paymentMethodId: number
    time: number
    totalMoney: number
    reason: string
    note: string
    paymentItemData: {
      payDebt: { ticketId: number; amount: number }[]
      prepayment: {
        ticketId: number
        ticketItemId: number // nếu không chọn ticketItem thì là tạm ứng vào đơn
        voucherItemType: PaymentVoucherItemType
        amount: number
      }[]
      moneyTopUpAdd: number // phải validate, nếu trả hết nợ thì mới được ký quỹ
    }
  }) {
    const {
      oid,
      customerId,
      paymentMethodId,
      time,
      cashierId,
      totalMoney,
      reason,
      note,
      paymentItemData,
    } = options
    const PREFIX = `customerId=${customerId} payment failed`

    const moneyDebtReduce = paymentItemData.payDebt.reduce((acc, item) => acc + item.amount, 0)
    const moneyPrepaymentReduce = paymentItemData.prepayment.reduce((acc, item) => {
      return acc + item.amount
    }, 0)

    const moneyReduce = moneyDebtReduce + moneyPrepaymentReduce + paymentItemData.moneyTopUpAdd

    if (totalMoney !== moneyReduce) {
      throw new BusinessError('Tổng số tiền không khớp', { moneyReduce, totalMoney })
    }

    try {
      return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
        // === 1. UPDATE CUSTOMER ===
        const customerOrigin = await this.customerManager.updateOneAndReturnEntity(
          manager,
          { id: customerId },
          { updatedAt: Date.now() }
        )

        if (moneyDebtReduce < customerOrigin.debt && paymentItemData.moneyTopUpAdd > 0) {
          throw new BusinessError('Số tiền không đúng, trả hết nợ trước khi ký quỹ', {
            moneyDebtReduce,
            customerOriginDebt: customerOrigin.debt,
            moneyTopUpAdd: paymentItemData.moneyTopUpAdd,
          })
        }

        const customerModified = await this.customerManager.updateOneAndReturnEntity(
          manager,
          { oid, id: customerId },
          { debt: () => `debt - ${moneyDebtReduce + paymentItemData.moneyTopUpAdd}` }
        )

        const paymentInsert: PaymentInsertType = {
          oid,
          paymentMethodId,
          paymentPersonType: PaymentPersonType.Customer,
          personId: customerId,
          createdAt: time,
          moneyDirection: MoneyDirection.In,
          money: totalMoney,
          debtAmount: -(moneyDebtReduce + paymentItemData.moneyTopUpAdd),
          openDebt: customerOrigin.debt,
          closeDebt: customerModified.debt,
          cashierId,
          note: note || '',
          reason: reason || '',
        }
        const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
          manager,
          paymentInsert
        )

        const paymentItemInsertList: PaymentItemInsertType[] = []
        let customerOpenDebt = customerOrigin.debt
        const ticketModifiedList: Ticket[] = []
        if (paymentItemData.payDebt.length) {
          const ticketUpdatedList = await this.ticketManager.bulkUpdate({
            manager,
            tempList: paymentItemData.payDebt.map((i) => ({
              id: i.ticketId,
              amount: i.amount,
            })),
            condition: {
              oid,
              customerId,
              status: TicketStatus.Debt,
              debt: { RAW_QUERY: '"debt" >= temp."amount"' },
            },
            compare: ['id'],
            update: {
              paid: (t) => `paid + ${t}.amount`,
              debt: (t) => `debt - ${t}.amount`,
              status: (t: string, u: string) => ` CASE
                                    WHEN("${u}"."debt" = ${t}."amount") THEN ${TicketStatus.Completed} 
                                    ELSE ${TicketStatus.Debt}
                                  END`,
            },
            options: { requireEqualLength: true },
          })
          ticketModifiedList.push(...ticketUpdatedList)

          paymentItemData.payDebt.forEach((itemData, index) => {
            const paymentItemInsert: PaymentItemInsertType = {
              oid,
              paymentId: paymentCreated.id,
              paymentPersonType: PaymentPersonType.Customer,
              personId: customerId,
              createdAt: time,

              voucherType: PaymentVoucherType.Ticket,
              voucherId: itemData.ticketId,
              voucherItemType: PaymentVoucherItemType.Other,
              voucherItemId: 0,
              paymentVoucherTiming: PaymentVoucherTiming.PayDebt,

              paidAmount: itemData.amount,
              debtAmount: -itemData.amount,
              openDebt: customerOpenDebt,
              closeDebt: customerOpenDebt - itemData.amount,
              cashierId,
              note: note || '',
            }
            customerOpenDebt = paymentItemInsert.closeDebt
            paymentItemInsertList.push(paymentItemInsert)
          })
        }

        if (paymentItemData.prepayment.length) {
          const ticketUpdatedList = await this.ticketManager.bulkUpdate({
            manager,
            tempList: paymentItemData.prepayment.map((i) => ({
              id: i.ticketId,
              amount: i.amount,
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
              paid: (t) => `paid + ${t}.amount`,
              debt: (t) => `debt - ${t}.amount`,
              status: (t: string, u: string) => ` CASE
                                    WHEN("${u}"."status" = ${TicketStatus.Draft}) THEN ${TicketStatus.Deposited} 
                                    WHEN("${u}"."status" = ${TicketStatus.Schedule}) THEN ${TicketStatus.Deposited} 
                                    WHEN("${u}"."status" = ${TicketStatus.Deposited}) THEN ${TicketStatus.Deposited} 
                                    WHEN("${u}"."status" = ${TicketStatus.Executing}) THEN ${TicketStatus.Executing} 
                                    ELSE ${TicketStatus.Executing}
                                  END`,
            },
            options: { requireEqualLength: true },
          })
          ticketModifiedList.push(...ticketUpdatedList)

          paymentItemData.prepayment.forEach((itemData, index) => {
            const paymentItemInsert: PaymentItemInsertType = {
              oid,
              paymentId: paymentCreated.id,
              paymentPersonType: PaymentPersonType.Customer,
              personId: customerId,
              createdAt: time,

              voucherType: PaymentVoucherType.Ticket,
              voucherId: itemData.ticketId,
              voucherItemType: itemData.voucherItemType,
              voucherItemId: itemData.ticketItemId,
              paymentVoucherTiming: PaymentVoucherTiming.Prepayment,

              paidAmount: itemData.amount,
              debtAmount: 0,
              openDebt: customerOpenDebt,
              closeDebt: customerOpenDebt,
              cashierId,
              note: note || '',
            }
            paymentItemInsertList.push(paymentItemInsert)
          })
        }

        if (paymentItemData.moneyTopUpAdd > 0) {
          const paymentInsert: PaymentItemInsertType = {
            oid,
            paymentId: paymentCreated.id,
            paymentPersonType: PaymentPersonType.Customer,
            personId: customerId,
            createdAt: time,

            voucherType: PaymentVoucherType.Other,
            voucherId: 0,
            voucherItemType: PaymentVoucherItemType.Other,
            voucherItemId: 0,
            paymentVoucherTiming: PaymentVoucherTiming.TopUp,

            paidAmount: paymentItemData.moneyTopUpAdd,
            debtAmount: -paymentItemData.moneyTopUpAdd,
            openDebt: customerOpenDebt,
            closeDebt: customerOpenDebt - paymentItemData.moneyTopUpAdd,
            cashierId,
            note: note || '',
          }
          paymentItemInsertList.push(paymentInsert)
        }

        const paymentItemCreatedList = await this.paymentItemManager.insertManyAndReturnEntity(
          manager,
          paymentItemInsertList
        )

        return {
          customer: customerModified,
          ticketModifiedList,
          paymentCreated,
          paymentItemCreatedList,
        }
      })
    } catch (error) {
      console.log(' CustomerPaymentOperation ~ error:', error)
      throw new BusinessError(error.message)
    }
  }
}
