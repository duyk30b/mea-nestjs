import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers'
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
import { TicketStatus } from '../../entities/ticket.entity'
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
export class CustomerRefundOperation {
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

  async startRefund(options: {
    oid: number
    customerId: number
    cashierId: number
    paymentMethodId: number
    ticketId: number
    totalMoney: number
    time: number
    reason: string
    note: string
    refundItemList: {
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
  }) {
    const {
      oid,
      paymentMethodId,
      customerId,
      ticketId,
      time,
      cashierId,
      totalMoney,
      reason,
      note,
      refundItemList,
    } = options

    const moneyItemReduce = refundItemList.reduce((acc, item) => acc + item.paidAmount, 0) || 0

    if (totalMoney <= 0 || totalMoney !== moneyItemReduce) {
      throw new BusinessError('Số tiền hoàn trả không hợp lệ', { totalMoney, moneyItemReduce })
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. TICKET: update ===
      const ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          status: { IN: [TicketStatus.Deposited, TicketStatus.Executing] },
        },
        {
          paid: () => `paid - ${totalMoney}`,
          debt: () => `debt + ${totalMoney}`,
        }
      )
      if (ticketModified.paid < 0) {
        throw new BusinessError(`Số tiền hoàn trả vượt quá số tiền cho phép`, {
          totalMoney,
          paidOrigin: ticketModified.paid + totalMoney,
        })
      }

      // === 2. CUSTOMER: query ===
      const customer = await this.customerManager.findOneBy(manager, {
        oid,
        id: ticketModified.customerId,
      })
      if (!customer) {
        throw new Error(`Khách hàng không tồn tại trên hệ thống`)
      }
      const customerCloseDebt = customer.debt
      const customerOpenDebt = customer.debt

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const paymentInsert: PaymentInsertType = {
        oid,
        paymentMethodId,
        paymentPersonType: PaymentPersonType.Customer,
        personId: customerId,
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

      // === 4. INSERT CUSTOMER_PAYMENT_ITEM ===
      const paymentItemInsertList = refundItemList.map((itemData, index) => {
        const paymentItemInsert: PaymentItemInsertType = {
          oid,
          paymentId: paymentCreated.id,
          paymentPersonType: PaymentPersonType.Customer,
          personId: customerId,
          createdAt: time,

          voucherType: PaymentVoucherType.Ticket,
          voucherId: ticketId,
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
        return paymentItemInsert
      })

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

      if (refundItemList.length) {
        const itemProcedureList = refundItemList
          .filter((i) => i.voucherItemType === PaymentVoucherItemType.TicketProcedure)
          .map((i) => ({
            ...i,
            id: i.ticketItemId,
            paymentMoneyStatus: PaymentMoneyStatus.Pending,
          }))
        ticketProcedureModifiedList = await this.ticketProcedureManager.bulkUpdate({
          manager,
          condition: {
            oid,
            ticketId,
            paymentMoneyStatus: PaymentMoneyStatus.Paid,
          },
          compare: ['id'],
          tempList: itemProcedureList,
          update: ['paymentMoneyStatus'],
          options: { requireEqualLength: true },
        })

        const itemConsumable = refundItemList
          .filter((i) => i.voucherItemType === PaymentVoucherItemType.TicketProductConsumable)
          .map((i) => ({
            ...i,
            id: i.ticketItemId,
            paymentMoneyStatus: PaymentMoneyStatus.Pending,
          }))
        ticketProductConsumableModifiedList = await this.ticketProductManager.bulkUpdate({
          manager,
          condition: {
            oid,
            ticketId,
            paymentMoneyStatus: PaymentMoneyStatus.Paid,
          },
          compare: ['id'],
          tempList: itemConsumable,
          update: ['paymentMoneyStatus'],
          options: { requireEqualLength: true },
        })

        const itemPrescription = refundItemList
          .filter((i) => i.voucherItemType === PaymentVoucherItemType.TicketProductPrescription)
          .map((i) => ({
            ...i,
            id: i.ticketItemId,
            paymentMoneyStatus: PaymentMoneyStatus.Pending,
          }))
        ticketProductPrescriptionModifiedList = await this.ticketProductManager.bulkUpdate({
          manager,
          condition: {
            oid,
            ticketId,
            paymentMoneyStatus: PaymentMoneyStatus.Paid,
          },
          compare: ['id'],
          tempList: itemPrescription,
          update: ['paymentMoneyStatus'],
          options: { requireEqualLength: true },
        })

        const itemLaboratoryList = refundItemList
          .filter((i) => i.voucherItemType === PaymentVoucherItemType.TicketLaboratory)
          .map((i) => ({
            ...i,
            id: i.ticketItemId,
            paymentMoneyStatus: PaymentMoneyStatus.Pending,
          }))
        ticketLaboratoryModifiedList = await this.ticketLaboratoryManager.bulkUpdate({
          manager,
          condition: {
            oid,
            ticketId,
            paymentMoneyStatus: PaymentMoneyStatus.Paid,
          },
          compare: ['id'],
          tempList: itemLaboratoryList,
          update: ['paymentMoneyStatus'],
          options: { requireEqualLength: true },
        })

        const itemRadiologyList = refundItemList
          .filter((i) => i.voucherItemType === PaymentVoucherItemType.TicketRadiology)
          .map((i) => ({
            ...i,
            id: i.ticketItemId,
            paymentMoneyStatus: PaymentMoneyStatus.Pending,
          }))
        ticketRadiologyModifiedList = await this.ticketRadiologyManager.bulkUpdate({
          manager,
          condition: {
            oid,
            ticketId,
            paymentMoneyStatus: PaymentMoneyStatus.Paid,
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

        const tlgUpdateList = ESArray.uniqueArray(tlgIdList)
          .filter((i) => !!i)
          .map((tlgId) => {
            const tlList = ticketLaboratoryList.filter((i) => i.ticketLaboratoryGroupId === tlgId)
            const { paymentMoneyStatus } =
              this.ticketLaboratoryGroupManager.calculatorPaymentMoneyStatus({
                ticketLaboratoryList: tlList,
              })
            return {
              id: tlgId,
              paymentMoneyStatus,
            }
          })
        ticketLaboratoryGroupModifiedList = await this.ticketLaboratoryGroupManager.bulkUpdate({
          manager,
          compare: ['id'],
          condition: { oid },
          tempList: tlgUpdateList,
          update: ['paymentMoneyStatus'],
          options: { requireEqualLength: true },
        })
      }

      return {
        ticketModified,
        customer,
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
