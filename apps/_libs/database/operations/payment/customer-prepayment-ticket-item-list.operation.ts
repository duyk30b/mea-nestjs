import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers'
import { BusinessError } from '../../common/error'
import { DiscountType, PaymentMoneyStatus } from '../../common/variable'
import { TicketLaboratoryGroup } from '../../entities'
import {
  PaymentTicketItemInsertType,
  TicketItemType,
} from '../../entities/payment-ticket-item.entity'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../entities/payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  CustomerManager,
  PaymentManager,
  PaymentTicketItemManager,
  TicketLaboratoryGroupManager,
  TicketLaboratoryManager,
  TicketManager,
  TicketProcedureManager,
  TicketProductManager,
  TicketRadiologyManager,
} from '../../repositories'

@Injectable()
export class CustomerPrepaymentTicketItemListOperation {
  constructor(
    private dataSource: DataSource,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager,
    private paymentTicketItemManager: PaymentTicketItemManager,
    private ticketManager: TicketManager,
    private ticketProductManager: TicketProductManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketLaboratoryGroupManager: TicketLaboratoryGroupManager,
    private ticketRadiologyManager: TicketRadiologyManager
  ) { }

  async startPrepaymentTicketItemList(options: {
    oid: number
    ticketId: number
    customerId: number
    cashierId: number
    paymentMethodId: number
    time: number
    paidAmount: number
    note: string
    ticketItemList: {
      ticketItemType: TicketItemType
      ticketItemId: number
      interactId: number
      expectedPrice: number
      discountMoney: number
      discountPercent: number
      discountType: DiscountType
      actualPrice: number
      quantity: number
    }[]
  }) {
    const {
      oid,
      ticketId,
      customerId,
      cashierId,
      paymentMethodId,
      time,
      paidAmount,
      note,
      ticketItemList,
    } = options

    const paidAmountReduce = ticketItemList.reduce(
      (acc, item) => acc + item.actualPrice * item.quantity,
      0
    )

    if (paidAmountReduce !== paidAmount) {
      throw new BusinessError('Tổng số tiền không khớp', { paidAmount, paidAmountReduce })
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET ===
      const ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
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
        {
          paid: () => `paid + ${paidAmount}`,
          debt: () => `debt - ${paidAmount}`,
          status: () => ` CASE
                              WHEN("status" = ${TicketStatus.Draft}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Schedule}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Deposited}) THEN ${TicketStatus.Deposited} 
                              WHEN("status" = ${TicketStatus.Executing}) THEN ${TicketStatus.Executing} 
                              ELSE ${TicketStatus.Executing}
                          END`,
        }
      )

      const customer = await this.customerManager.findOneBy(manager, {
        oid,
        id: customerId,
      })
      if (!customer) {
        throw new Error(`Khách hàng không tồn tại trên hệ thống`)
      }

      const customerCloseDebt = customer.debt
      const customerOpenDebt = customer.debt

      const paymentInsert: PaymentInsertType = {
        oid,
        voucherType: PaymentVoucherType.Ticket,
        voucherId: ticketModified.id,
        personType: PaymentPersonType.Customer,
        personId: customerId,

        createdAt: time,
        paymentMethodId,
        cashierId,
        moneyDirection: MoneyDirection.In,
        paymentActionType: PaymentActionType.PrepaymentForTicketItemList,
        note: note || '',

        paidAmount,
        debtAmount: 0,
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
      }
      const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
        manager,
        paymentInsert
      )

      const paymentTicketItemInsertList = ticketItemList.map((i) => {
        const inserter: PaymentTicketItemInsertType = {
          oid,
          paymentId: paymentCreated.id,

          ticketId: ticketModified.id,
          ticketItemType: i.ticketItemType,
          ticketItemId: i.ticketItemId,
          interactId: i.interactId,

          expectedPrice: i.expectedPrice,
          discountMoney: i.discountMoney,
          discountPercent: i.discountPercent,
          discountType: i.discountType,
          actualPrice: i.actualPrice,
          quantity: i.quantity,
        }
        return inserter
      })
      const paymentTicketItemCreatedList =
        await this.paymentTicketItemManager.insertManyAndReturnEntity(
          manager,
          paymentTicketItemInsertList
        )

      // Cập nhật thanh toán vào item
      const ticketProcedureModifiedList = await this.ticketProcedureManager.bulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.Pending },
        compare: ['id'],
        tempList: ticketItemList
          .filter((i) => i.ticketItemType === TicketItemType.TicketProcedure)
          .map((i) => ({ ...i, id: i.ticketItemId, paymentMoneyStatus: PaymentMoneyStatus.Paid })),
        update: ['paymentMoneyStatus'],
        options: { requireEqualLength: true },
      })

      const ticketProductConsumableModifiedList = await this.ticketProductManager.bulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.Pending },
        compare: ['id'],
        tempList: ticketItemList
          .filter((i) => i.ticketItemType === TicketItemType.TicketProductConsumable)
          .map((i) => ({ ...i, id: i.ticketItemId, paymentMoneyStatus: PaymentMoneyStatus.Paid })),
        update: ['paymentMoneyStatus'],
        options: { requireEqualLength: true },
      })

      const ticketProductPrescriptionModifiedList = await this.ticketProductManager.bulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.Pending },
        compare: ['id'],
        tempList: ticketItemList
          .filter((i) => i.ticketItemType === TicketItemType.TicketProductPrescription)
          .map((i) => ({ ...i, id: i.ticketItemId, paymentMoneyStatus: PaymentMoneyStatus.Paid })),
        update: ['paymentMoneyStatus'],
        options: { requireEqualLength: true },
      })

      const ticketLaboratoryModifiedList = await this.ticketLaboratoryManager.bulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.Pending },
        compare: ['id'],
        tempList: ticketItemList
          .filter((i) => i.ticketItemType === TicketItemType.TicketLaboratory)
          .map((i) => ({ ...i, id: i.ticketItemId, paymentMoneyStatus: PaymentMoneyStatus.Paid })),
        update: ['paymentMoneyStatus'],
        options: { requireEqualLength: true },
      })

      const ticketRadiologyModifiedList = await this.ticketRadiologyManager.bulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.Pending },
        compare: ['id'],
        tempList: ticketItemList
          .filter((i) => i.ticketItemType === TicketItemType.TicketRadiology)
          .map((i) => ({ ...i, id: i.ticketItemId, paymentMoneyStatus: PaymentMoneyStatus.Paid })),
        update: ['paymentMoneyStatus'],
        options: { requireEqualLength: true },
      })

      // update lại ticketLaboratoryGroup
      let ticketLaboratoryGroupModifiedList: TicketLaboratoryGroup[]
      if (ticketLaboratoryModifiedList.length) {
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
        paymentTicketItemCreatedList,
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
