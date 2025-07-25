import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../common/error'
import { PaymentMoneyStatus } from '../../common/variable'
import {
  TicketLaboratory,
  TicketLaboratoryGroup,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
} from '../../entities'
import {
  PaymentItemInsertType,
  PaymentVoucherItemType,
  PaymentVoucherType,
} from '../../entities/payment-item.entity'
import { MoneyDirection, PaymentInsertType, PaymentPersonType } from '../../entities/payment.entity'
import Ticket, { TicketStatus } from '../../entities/ticket.entity'
import {
  CustomerManager,
  TicketLaboratoryGroupManager,
  TicketLaboratoryManager,
  TicketManager,
  TicketProcedureManager,
  TicketProductManager,
  TicketRadiologyManager,
} from '../../managers'
import { PaymentItemManager, PaymentManager } from '../../repositories'

@Injectable()
export class CustomerPaymentOperation {
  constructor(
    private dataSource: DataSource,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager,
    private paymentItemManager: PaymentItemManager,
    private ticketManager: TicketManager,
    private ticketProductManager: TicketProductManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketLaboratoryGroupManager: TicketLaboratoryGroupManager,
    private ticketRadiologyManager: TicketRadiologyManager
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
      payDebt: { ticketId: number; paidAmount: number }[]
      prepayment?: {
        ticketId: number
        itemList: {
          ticketItemId: number // nếu không chọn ticketItem thì là tạm ứng vào đơn
          voucherItemType: PaymentVoucherItemType
          paymentInteractId: number
          discountMoney: number
          discountPercent: number
          expectedPrice: number
          actualPrice: number
          quantity: number
          paidAmount: number
        }[]
      }
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

    const moneyDebtReduce = paymentItemData.payDebt.reduce((acc, item) => acc + item.paidAmount, 0)
    const moneyPrepaymentReduce =
      paymentItemData.prepayment?.itemList.reduce((acc, item) => acc + item.paidAmount, 0) || 0

    if (totalMoney <= 0) {
      throw new BusinessError('Số tiền thanh toán không hợp lệ', { totalMoney })
    }
    const moneyReduce = moneyDebtReduce + moneyPrepaymentReduce + paymentItemData.moneyTopUpAdd
    if (totalMoney !== moneyReduce) {
      throw new BusinessError('Tổng số tiền không khớp', { moneyReduce, totalMoney })
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE CUSTOMER ===
      const customerModified = await this.customerManager.updateOneAndReturnEntity(
        manager,
        { oid, id: customerId },
        { debt: () => `debt - ${moneyDebtReduce + paymentItemData.moneyTopUpAdd}` }
      )

      const debtOrigin = customerModified.debt + moneyDebtReduce + paymentItemData.moneyTopUpAdd

      if (moneyDebtReduce < debtOrigin && paymentItemData.moneyTopUpAdd > 0) {
        throw new BusinessError('Số tiền không đúng, trả hết nợ trước khi ký quỹ', {
          moneyDebtReduce,
          customerOriginDebt: debtOrigin,
          moneyTopUpAdd: paymentItemData.moneyTopUpAdd,
        })
      }

      const paymentInsert: PaymentInsertType = {
        oid,
        paymentMethodId,
        paymentPersonType: PaymentPersonType.Customer,
        personId: customerId,
        createdAt: time,
        moneyDirection: MoneyDirection.In,
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
      let customerOpenDebt = debtOrigin
      const ticketModifiedList: Ticket[] = []
      if (paymentItemData.payDebt.length) {
        const ticketUpdatedList = await this.ticketManager.bulkUpdate({
          manager,
          tempList: paymentItemData.payDebt.map((i) => ({
            id: i.ticketId,
            amount: i.paidAmount,
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
            paymentInteractId: 0,

            expectedPrice: itemData.paidAmount,
            discountMoney: 0,
            discountPercent: 0,
            actualPrice: itemData.paidAmount,
            quantity: 1,
            paidAmount: itemData.paidAmount,
            debtAmount: -itemData.paidAmount,
            openDebt: customerOpenDebt,
            closeDebt: customerOpenDebt - itemData.paidAmount,
            cashierId,
            note: reason || note || '',
          }
          customerOpenDebt = paymentItemInsert.closeDebt
          paymentItemInsertList.push(paymentItemInsert)
        })
      }

      if (paymentItemData.prepayment) {
        const ticketUpdated = await this.ticketManager.updateOneAndReturnEntity(
          manager,
          {
            oid,
            customerId,
            id: paymentItemData.prepayment.ticketId,
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
            paid: () => `paid + ${moneyPrepaymentReduce}`,
            debt: () => `debt - ${moneyPrepaymentReduce}`,
            status: () => ` CASE
                              WHEN("status" = ${TicketStatus.Draft}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Schedule}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Deposited}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Executing}) THEN ${TicketStatus.Executing} 
                              ELSE ${TicketStatus.Executing}
                            END`,
          }
        )

        ticketModifiedList.push(ticketUpdated)

        paymentItemData.prepayment.itemList.forEach((itemData, index) => {
          const paymentItemInsert: PaymentItemInsertType = {
            oid,
            paymentId: paymentCreated.id,
            paymentPersonType: PaymentPersonType.Customer,
            personId: customerId,
            createdAt: time,

            voucherType: PaymentVoucherType.Ticket,
            voucherId: paymentItemData.prepayment.ticketId,
            voucherItemType: itemData.voucherItemType,
            voucherItemId: itemData.ticketItemId,
            paymentInteractId: itemData.paymentInteractId,

            expectedPrice: itemData.expectedPrice,
            actualPrice: itemData.actualPrice,
            quantity: itemData.quantity,
            discountMoney: itemData.discountMoney,
            discountPercent: itemData.discountPercent,
            paidAmount: itemData.paidAmount,
            debtAmount: 0,
            openDebt: customerOpenDebt,
            closeDebt: customerOpenDebt,
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
          paymentPersonType: PaymentPersonType.Customer,
          personId: customerId,
          createdAt: time,

          voucherType: PaymentVoucherType.Other,
          voucherId: 0,
          voucherItemType: PaymentVoucherItemType.Other,
          voucherItemId: 0,
          paymentInteractId: 0,

          expectedPrice: paymentItemData.moneyTopUpAdd,
          actualPrice: paymentItemData.moneyTopUpAdd,
          quantity: 1,
          discountMoney: 0,
          discountPercent: 0,
          paidAmount: paymentItemData.moneyTopUpAdd,
          debtAmount: -paymentItemData.moneyTopUpAdd,
          openDebt: customerOpenDebt,
          closeDebt: customerOpenDebt - paymentItemData.moneyTopUpAdd,
          cashierId,
          note: reason || note || '',
        }
        paymentItemInsertList.push(paymentItemInsert)
      }

      const paymentItemCreatedList = await this.paymentItemManager.insertManyAndReturnEntity(
        manager,
        paymentItemInsertList
      )

      // Cập nhật thanh toán vào item
      let ticketProcedureModifiedList: TicketProcedure[]
      let ticketProductConsumableModifiedList: TicketProduct[]
      let ticketProductPrescriptionModifiedList: TicketProduct[]
      let ticketLaboratoryModifiedList: TicketLaboratory[]
      let ticketRadiologyModifiedList: TicketRadiology[]
      let ticketLaboratoryGroupModifiedList: TicketLaboratoryGroup[]

      if (paymentItemData.prepayment?.itemList.length) {
        const itemProcedureList = paymentItemData.prepayment.itemList
          .filter((i) => i.voucherItemType === PaymentVoucherItemType.TicketProcedure)
          .map((i) => ({ ...i, id: i.ticketItemId, paymentMoneyStatus: PaymentMoneyStatus.Paid }))
        ticketProcedureModifiedList = await this.ticketProcedureManager.bulkUpdate({
          manager,
          condition: {
            oid,
            ticketId: paymentItemData.prepayment.ticketId,
            paymentMoneyStatus: PaymentMoneyStatus.Pending,
          },
          compare: ['id'],
          tempList: itemProcedureList,
          update: ['paymentMoneyStatus'],
          options: { requireEqualLength: true },
        })

        const itemConsumable = paymentItemData.prepayment.itemList
          .filter((i) => i.voucherItemType === PaymentVoucherItemType.TicketProductConsumable)
          .map((i) => ({ ...i, id: i.ticketItemId, paymentMoneyStatus: PaymentMoneyStatus.Paid }))
        ticketProductConsumableModifiedList = await this.ticketProductManager.bulkUpdate({
          manager,
          condition: {
            oid,
            ticketId: paymentItemData.prepayment.ticketId,
            paymentMoneyStatus: PaymentMoneyStatus.Pending,
          },
          compare: ['id'],
          tempList: itemConsumable,
          update: ['paymentMoneyStatus'],
          options: { requireEqualLength: true },
        })

        const itemPrescription = paymentItemData.prepayment.itemList
          .filter((i) => i.voucherItemType === PaymentVoucherItemType.TicketProductPrescription)
          .map((i) => ({ ...i, id: i.ticketItemId, paymentMoneyStatus: PaymentMoneyStatus.Paid }))
        ticketProductPrescriptionModifiedList = await this.ticketProductManager.bulkUpdate({
          manager,
          condition: {
            oid,
            ticketId: paymentItemData.prepayment.ticketId,
            paymentMoneyStatus: PaymentMoneyStatus.Pending,
          },
          compare: ['id'],
          tempList: itemPrescription,
          update: ['paymentMoneyStatus'],
          options: { requireEqualLength: true },
        })

        const itemLaboratoryList = paymentItemData.prepayment.itemList
          .filter((i) => i.voucherItemType === PaymentVoucherItemType.TicketLaboratory)
          .map((i) => ({ ...i, id: i.ticketItemId, paymentMoneyStatus: PaymentMoneyStatus.Paid }))
        ticketLaboratoryModifiedList = await this.ticketLaboratoryManager.bulkUpdate({
          manager,
          condition: {
            oid,
            ticketId: paymentItemData.prepayment.ticketId,
            paymentMoneyStatus: PaymentMoneyStatus.Pending,
          },
          compare: ['id'],
          tempList: itemLaboratoryList,
          update: ['paymentMoneyStatus'],
          options: { requireEqualLength: true },
        })

        const itemRadiologyList = paymentItemData.prepayment.itemList
          .filter((i) => i.voucherItemType === PaymentVoucherItemType.TicketRadiology)
          .map((i) => ({ ...i, id: i.ticketItemId, paymentMoneyStatus: PaymentMoneyStatus.Paid }))
        ticketRadiologyModifiedList = await this.ticketRadiologyManager.bulkUpdate({
          manager,
          condition: {
            oid,
            ticketId: paymentItemData.prepayment.ticketId,
            paymentMoneyStatus: PaymentMoneyStatus.Pending,
          },
          compare: ['id'],
          tempList: itemRadiologyList,
          update: ['paymentMoneyStatus'],
          options: { requireEqualLength: true },
        })
      }

      // update lại ticketLaboratoryGroup
      if (ticketLaboratoryModifiedList?.length) {
        const tlgIdList = ticketLaboratoryModifiedList.map((i) => i.ticketLaboratoryGroupId)
        const ticketLaboratoryList = await this.ticketLaboratoryManager.findManyBy(manager, {
          oid,
          ticketLaboratoryGroupId: { IN: tlgIdList },
        })
        const tlgIdListCompleted = tlgIdList.filter((tlgId) => {
          const tlList = ticketLaboratoryList.filter((i) => i.ticketLaboratoryGroupId === tlgId)
          return tlList.every((i) => i.paymentMoneyStatus === PaymentMoneyStatus.Paid)
        })
        if (tlgIdListCompleted.length) {
          ticketLaboratoryGroupModifiedList =
            await this.ticketLaboratoryGroupManager.updateAndReturnEntity(
              manager,
              {
                oid,
                id: { IN: tlgIdListCompleted },
              },
              {
                paymentMoneyStatus: PaymentMoneyStatus.Paid,
              }
            )
        }
      }

      return {
        customerModified,
        ticketModifiedList,
        paymentCreated,
        paymentItemCreatedList,
        ticketProcedureModifiedList,
        ticketProductConsumableModifiedList,
        ticketProductPrescriptionModifiedList,
        ticketLaboratoryModifiedList,
        ticketRadiologyModifiedList,
        ticketLaboratoryGroupModifiedList,
      }
    })
    return transaction
  }
}
