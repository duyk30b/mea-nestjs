import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../common/error'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../entities/payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, TicketManager } from '../../managers'
import { PaymentManager } from '../../repositories'

@Injectable()
export class CustomerPayDebtOperation {
  constructor(
    private dataSource: DataSource,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager,
    private ticketManager: TicketManager
  ) { }

  async startPayDebt(options: {
    oid: number
    customerId: number
    cashierId: number
    paymentMethodId: number
    time: number
    paidAmount: number
    note: string
    dataList: { ticketId: number; paidAmount: number }[]
  }) {
    const { oid, customerId, cashierId, paymentMethodId, time, paidAmount, note, dataList } =
      options

    const paidAmountReduce = dataList.reduce((acc, item) => acc + item.paidAmount, 0)
    if (paidAmount !== paidAmountReduce) {
      throw new BusinessError('Tổng số tiền không khớp', { paidAmount, paidAmountReduce })
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE CUSTOMER ===
      const ticketModifiedList = await this.ticketManager.bulkUpdate({
        manager,
        tempList: dataList.map((i) => ({
          id: i.ticketId,
          paidAmount: i.paidAmount,
        })),
        condition: {
          oid,
          status: TicketStatus.Debt,
          customerId,
          debt: { RAW_QUERY: '"debt" >= temp."paidAmount"' },
        },
        compare: ['id'],
        update: {
          paid: (t) => `paid + "${t}"."paidAmount"`,
          debt: (t) => `debt - "${t}"."paidAmount"`,
          status: (t: string, u: string) => ` CASE
                                    WHEN("${u}"."debt" = "${t}"."paidAmount") THEN ${TicketStatus.Completed} 
                                    ELSE ${TicketStatus.Debt}
                                  END`,
        },
        options: { requireEqualLength: true },
      })

      const customerModified = await this.customerManager.updateOneAndReturnEntity(
        manager,
        { oid, id: customerId },
        { debt: () => `debt - ${paidAmount}` }
      )
      const customerCloseDebt = customerModified.debt
      const customerOpenDebt = customerModified.debt + paidAmount

      const paymentInsertList = ticketModifiedList.map((ticketModified) => {
        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.Ticket,
          voucherId: ticketModified.id,
          personType: PaymentPersonType.Customer,
          personId: ticketModified.customerId,

          createdAt: time,
          paymentMethodId,
          cashierId,
          moneyDirection: MoneyDirection.In,
          note: note || '',

          paidAmount,
          paymentActionType: PaymentActionType.PayDebt,
          debtAmount: -paidAmount,
          openDebt: customerOpenDebt,
          closeDebt: customerCloseDebt,
        }
        return paymentInsert
      })
      const paymentCreatedList = await this.paymentManager.insertManyAndReturnEntity(
        manager,
        paymentInsertList
      )

      return { ticketModifiedList, customerModified, paymentCreatedList }
    })

    return transaction
  }
}
