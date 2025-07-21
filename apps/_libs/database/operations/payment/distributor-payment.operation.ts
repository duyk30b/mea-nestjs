import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../common/error'
import {
  PaymentItemInsertType,
  PaymentVoucherItemType,
  PaymentVoucherType,
} from '../../entities/payment-item.entity'
import { MoneyDirection, PaymentInsertType, PaymentPersonType } from '../../entities/payment.entity'
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
    cashierId: number
    paymentMethodId: number
    time: number
    totalMoney: number
    reason: string
    note: string
    paymentItemData: {
      payDebt: { receiptId: number; amount: number }[]
      prepayment?: {
        receiptId: number
        itemList: {
          receiptItemId: number // nếu không chọn receiptItem thì là tạm ứng vào đơn
          voucherItemType: PaymentVoucherItemType
          paymentInteractId: number
          amount: number
        }[]
      }
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

    const moneyDebtReduce = paymentItemData.payDebt.reduce((acc, item) => acc + item.amount, 0)
    const moneyPrepaymentReduce =
      paymentItemData.prepayment?.itemList.reduce((acc, item) => acc + item.amount, 0) || 0

    if (totalMoney <= 0) {
      throw new BusinessError('Số tiền thanh toán không hợp lệ', { totalMoney })
    }
    const moneyReduce = moneyDebtReduce + moneyPrepaymentReduce + paymentItemData.moneyTopUpAdd
    if (totalMoney !== moneyReduce) {
      throw new BusinessError('Tổng số tiền không khớp', { moneyReduce, totalMoney })
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE CUSTOMER ===
      const distributorModified = await this.distributorManager.updateOneAndReturnEntity(
        manager,
        { oid, id: distributorId },
        { debt: () => `debt - ${moneyDebtReduce + paymentItemData.moneyTopUpAdd}` }
      )

      const debtOrigin = distributorModified.debt + moneyDebtReduce + paymentItemData.moneyTopUpAdd

      if (moneyDebtReduce < debtOrigin && paymentItemData.moneyTopUpAdd > 0) {
        throw new BusinessError('Số tiền không đúng, trả hết nợ trước khi ký quỹ', {
          moneyDebtReduce,
          distributorOriginDebt: debtOrigin,
          moneyTopUpAdd: paymentItemData.moneyTopUpAdd,
        })
      }

      const paymentInsert: PaymentInsertType = {
        oid,
        paymentMethodId,
        paymentPersonType: PaymentPersonType.Distributor,
        personId: distributorId,
        createdAt: time,
        moneyDirection: MoneyDirection.Out,
        money: totalMoney,
        cashierId,
        note: note || '',
        reason: reason || '',
      }
      const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
        manager,
        paymentInsert
      )

      const paymentItemInsertList: PaymentItemInsertType[] = []
      let distributorOpenDebt = debtOrigin
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
            paymentInteractId: 0,

            paidAmount: itemData.amount,
            debtAmount: -itemData.amount,
            openDebt: distributorOpenDebt,
            closeDebt: distributorOpenDebt - itemData.amount,
            cashierId,
            note: reason || note || '',
          }
          distributorOpenDebt = paymentItemInsert.closeDebt
          paymentItemInsertList.push(paymentItemInsert)
        })
      }

      if (paymentItemData.prepayment) {
        const receiptUpdated = await this.receiptManager.updateOneAndReturnEntity(
          manager,
          {
            oid,
            distributorId,
            id: paymentItemData.prepayment.receiptId,
            status: {
              IN: [
                ReceiptStatus.Draft,
                ReceiptStatus.Schedule,
                ReceiptStatus.Deposited,
                ReceiptStatus.Executing,
              ],
            },
          },
          {
            paid: () => `paid + ${moneyPrepaymentReduce}`,
            debt: () => `debt - ${moneyPrepaymentReduce}`,
            status: () => ` CASE
                              WHEN("status" = ${ReceiptStatus.Draft}) THEN ${ReceiptStatus.Deposited} 
                              WHEN("status" = ${ReceiptStatus.Schedule}) THEN ${ReceiptStatus.Deposited} 
                              WHEN("status" = ${ReceiptStatus.Deposited}) THEN ${ReceiptStatus.Deposited} 
                              WHEN("status" = ${ReceiptStatus.Executing}) THEN ${ReceiptStatus.Executing} 
                              ELSE ${ReceiptStatus.Executing}
                            END`,
          }
        )

        receiptModifiedList.push(receiptUpdated)

        paymentItemData.prepayment?.itemList.forEach((itemData, index) => {
          const paymentItemInsert: PaymentItemInsertType = {
            oid,
            paymentId: paymentCreated.id,
            paymentPersonType: PaymentPersonType.Distributor,
            personId: distributorId,
            createdAt: time,

            voucherType: PaymentVoucherType.Receipt,
            voucherId: paymentItemData.prepayment.receiptId,
            voucherItemType: itemData.voucherItemType,
            voucherItemId: itemData.receiptItemId,
            paymentInteractId: itemData.paymentInteractId,

            paidAmount: itemData.amount,
            debtAmount: 0,
            openDebt: distributorOpenDebt,
            closeDebt: distributorOpenDebt,
            cashierId,
            note: reason || note || '',
          }
          paymentItemInsertList.push(paymentItemInsert)
        })
      }

      if (paymentItemData.moneyTopUpAdd > 0) {
        const paymentItemInsert: PaymentItemInsertType = {
          oid,
          paymentId: paymentCreated.id,
          paymentPersonType: PaymentPersonType.Distributor,
          personId: distributorId,
          createdAt: time,

          voucherType: PaymentVoucherType.Other,
          voucherId: 0,
          voucherItemType: PaymentVoucherItemType.Other,
          voucherItemId: 0,
          paymentInteractId: 0,

          paidAmount: paymentItemData.moneyTopUpAdd,
          debtAmount: -paymentItemData.moneyTopUpAdd,
          openDebt: distributorOpenDebt,
          closeDebt: distributorOpenDebt - paymentItemData.moneyTopUpAdd,
          cashierId,
          note: reason || note || '',
        }
        paymentItemInsertList.push(paymentItemInsert)
      }

      const paymentItemCreatedList = await this.paymentItemManager.insertManyAndReturnEntity(
        manager,
        paymentItemInsertList
      )

      return {
        distributorModified,
        receiptModifiedList,
        paymentCreated,
        paymentItemCreatedList,
      }
    })
    return transaction
  }
}
