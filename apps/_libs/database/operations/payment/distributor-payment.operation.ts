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
import Receipt, { ReceiptStatus } from '../../entities/receipt.entity'
import { DistributorManager, ReceiptManager } from '../../managers'
import { PaymentItemManager, PaymentManager } from '../../repositories'

@Injectable()
export class DistributorPaymentOperation {
  constructor(
    private dataSource: DataSource,
    private distributorManager: DistributorManager,
    private paymentManager: PaymentManager,
    private paymentItemManager: PaymentItemManager,
    private receiptManager: ReceiptManager
  ) { }

  async startPayment(options: {
    oid: number
    distributorId: number
    paymentMethodId: number
    time: number
    cashierId: number
    totalMoney: number
    reason: string
    note: string
    paymentItemData: {
      payDebt: { receiptId: number; amount: number }[]
      prepayment: {
        receiptId: number
        receiptItemId: number // nếu không chọn receiptItem thì là tạm ứng vào đơn
        voucherItemType: PaymentVoucherItemType
        amount: number
      }[]
      moneyTopUpAdd: number // phải validate, nếu trả hết nợ thì mới được ký quỹ
    }
  }) {
    const {
      oid,
      distributorId,
      paymentMethodId,
      time,
      cashierId,
      totalMoney,
      reason,
      note,
      paymentItemData,
    } = options
    const PREFIX = `distributorId=${distributorId} payment failed`

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
        const distributorOrigin = await this.distributorManager.updateOneAndReturnEntity(
          manager,
          { id: distributorId, isActive: 1 },
          { isActive: 1 }
        )

        if (moneyDebtReduce < distributorOrigin.debt && paymentItemData.moneyTopUpAdd > 0) {
          throw new BusinessError('Số tiền không đúng, trả hết nợ trước khi ký quỹ', {
            moneyDebtReduce,
            distributorOriginDebt: distributorOrigin.debt,
            moneyTopUpAdd: paymentItemData.moneyTopUpAdd,
          })
        }

        const distributorModified = await this.distributorManager.updateOneAndReturnEntity(
          manager,
          { oid, id: distributorId },
          { debt: () => `debt - ${moneyDebtReduce + paymentItemData.moneyTopUpAdd}` }
        )

        const paymentInsert: PaymentInsertType = {
          oid,
          paymentMethodId,
          paymentPersonType: PaymentPersonType.Distributor,
          personId: distributorId,
          createdAt: time,
          moneyDirection: MoneyDirection.In,

          money: totalMoney,
          debtAmount: -(moneyDebtReduce + paymentItemData.moneyTopUpAdd),
          openDebt: distributorOrigin.debt,
          closeDebt: distributorModified.debt,
          cashierId,
          note: note || '',
          reason: reason || '',
        }
        const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
          manager,
          paymentInsert
        )

        const paymentItemInsertList: PaymentItemInsertType[] = []
        let distributorOpenDebt = distributorOrigin.debt
        const receiptModifiedList: Receipt[] = []
        if (paymentItemData.payDebt.length) {
          const receiptUpdatedList = await this.receiptManager.bulkUpdate({
            manager,
            tempList: paymentItemData.payDebt.map((i) => ({
              id: i.receiptId,
              amount: i.amount,
            })),
            condition: {
              oid,
              distributorId,
              status: ReceiptStatus.Debt,
              debt: { RAW_QUERY: '"debt" >= temp."amount"' },
            },
            compare: ['id'],
            update: {
              paid: (t) => `paid + ${t}.amount`,
              debt: (t) => `debt - ${t}.amount`,
              status: (t: string, u: string) => ` CASE
                                    WHEN("${u}"."debt" = ${t}."amount") THEN ${ReceiptStatus.Completed} 
                                    ELSE ${ReceiptStatus.Debt}
                                  END`,
            },
            options: { requireEqualLength: true },
          })
          receiptModifiedList.push(...receiptUpdatedList)

          paymentItemData.payDebt.forEach((itemData, index) => {
            const paymentItemInsert: PaymentItemInsertType = {
              oid,
              paymentId: paymentCreated.id,
              paymentPersonType: PaymentPersonType.Distributor,
              personId: distributorId,
              createdAt: time,

              voucherType: PaymentVoucherType.Receipt,
              voucherId: itemData.receiptId,
              voucherItemType: PaymentVoucherItemType.Other,
              voucherItemId: 0,
              paymentVoucherTiming: PaymentVoucherTiming.PayDebt,

              paidAmount: itemData.amount,
              debtAmount: -itemData.amount,
              openDebt: distributorOpenDebt,
              closeDebt: distributorOpenDebt - itemData.amount,
              cashierId,
              note: note || '',
            }
            distributorOpenDebt = paymentItemInsert.closeDebt
            paymentItemInsertList.push(paymentItemInsert)
          })
        }

        if (paymentItemData.prepayment.length) {
          const receiptUpdatedList = await this.receiptManager.bulkUpdate({
            manager,
            tempList: paymentItemData.prepayment.map((i) => ({
              id: i.receiptId,
              amount: i.amount,
            })),
            condition: {
              oid,
              distributorId,
              status: {
                IN: [
                  ReceiptStatus.Draft,
                  ReceiptStatus.Schedule,
                  ReceiptStatus.Deposited,
                  ReceiptStatus.Executing,
                ],
              },
            },
            compare: ['id'],
            update: {
              paid: (t) => `paid + ${t}.amount`,
              debt: (t) => `debt - ${t}.amount`,
              status: (t: string, u: string) => ` CASE
                                    WHEN("${u}"."status" = ${ReceiptStatus.Draft}) THEN ${ReceiptStatus.Deposited} 
                                    WHEN("${u}"."status" = ${ReceiptStatus.Schedule}) THEN ${ReceiptStatus.Deposited} 
                                    WHEN("${u}"."status" = ${ReceiptStatus.Deposited}) THEN ${ReceiptStatus.Deposited} 
                                    WHEN("${u}"."status" = ${ReceiptStatus.Executing}) THEN ${ReceiptStatus.Executing} 
                                    ELSE ${ReceiptStatus.Executing}
                                  END`,
            },
            options: { requireEqualLength: true },
          })
          receiptModifiedList.push(...receiptUpdatedList)

          paymentItemData.prepayment.forEach((itemData, index) => {
            const paymentItemInsert: PaymentItemInsertType = {
              oid,
              paymentId: paymentCreated.id,
              paymentPersonType: PaymentPersonType.Distributor,
              personId: distributorId,
              createdAt: time,

              voucherType: PaymentVoucherType.Receipt,
              voucherId: itemData.receiptId,
              voucherItemType: itemData.voucherItemType,
              voucherItemId: itemData.receiptItemId,
              paymentVoucherTiming: PaymentVoucherTiming.Prepayment,

              paidAmount: itemData.amount,
              debtAmount: 0,
              openDebt: distributorOpenDebt,
              closeDebt: distributorOpenDebt,
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
            paymentPersonType: PaymentPersonType.Distributor,
            personId: distributorId,
            createdAt: time,

            voucherType: PaymentVoucherType.Other,
            voucherId: 0,
            voucherItemType: PaymentVoucherItemType.Other,
            voucherItemId: 0,
            paymentVoucherTiming: PaymentVoucherTiming.TopUp,

            paidAmount: paymentItemData.moneyTopUpAdd,
            debtAmount: -paymentItemData.moneyTopUpAdd,
            openDebt: distributorOpenDebt,
            closeDebt: distributorOpenDebt - paymentItemData.moneyTopUpAdd,
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
          distributor: distributorModified,
          receiptModifiedList,
          paymentCreated,
          paymentItemCreatedList,
        }
      })
    } catch (error) {
      console.log(' DistributorPaymentOperation ~ error:', error)
      throw new BusinessError(error.message)
    }
  }
}
