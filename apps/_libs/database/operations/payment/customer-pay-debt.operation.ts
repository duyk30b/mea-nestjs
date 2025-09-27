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
import { CustomerManager, PaymentManager, TicketRepository } from '../../repositories'

@Injectable()
export class CustomerPayDebtOperation {
  constructor(
    private dataSource: DataSource,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager,
    private ticketRepository: TicketRepository
  ) { }

  async startPayDebt(options: {
    oid: number
    customerId: number
    cashierId: number
    paymentMethodId: number
    time: number
    paidAmount: number
    note: string
    dataList: { ticketId: string; paidAmount: number }[]
  }) {
    const { oid, customerId, cashierId, paymentMethodId, time, paidAmount, dataList } = options
    let note = options.note

    const paidAmountReduce = dataList.reduce((acc, item) => acc + item.paidAmount, 0)
    if (paidAmount !== paidAmountReduce) {
      throw new BusinessError('Tổng số tiền không khớp', { paidAmount, paidAmountReduce })
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE CUSTOMER ===
      const ticketModifiedList = await this.ticketRepository.managerBulkUpdate({
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
        compare: { id: { cast: 'bigint' } },
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

      let customerOpenDebt = customerModified.debt + paidAmount
      if (!note && dataList.length > 0) {
        note = `Trả nợ ${paidAmount} vào ${dataList.length} đơn: ${dataList.map((i) => i.ticketId)}`
      }

      const paymentInsertList = dataList.map((item) => {
        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.Ticket,
          voucherId: item.ticketId,
          personType: PaymentPersonType.Customer,
          personId: customerId,

          createdAt: time,
          paymentMethodId,
          cashierId,
          moneyDirection: MoneyDirection.In,
          note: note || '',

          paidAmount: item.paidAmount,
          paymentActionType: PaymentActionType.PayDebt,
          debtAmount: -item.paidAmount,
          openDebt: customerOpenDebt,
          closeDebt: customerOpenDebt - item.paidAmount,
        }
        customerOpenDebt = paymentInsert.closeDebt
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
