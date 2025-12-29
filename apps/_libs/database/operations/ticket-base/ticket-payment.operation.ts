import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { ESArray } from '../../../common/helpers'
import { BusinessError } from '../../common/error'
import { DiscountType, PaymentMoneyStatus } from '../../common/variable'
import {
  Customer,
  TicketLaboratoryGroup,
  TicketPaymentDetail,
  TicketRegimen,
  TicketRegimenItem,
} from '../../entities'
import PaymentTicketItem, {
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
  CustomerRepository,
  PaymentRepository,
  PaymentTicketItemRepository,
  TicketLaboratoryGroupRepository,
  TicketLaboratoryRepository,
  TicketPaymentDetailRepository,
  TicketProcedureRepository,
  TicketProductRepository,
  TicketRadiologyRepository,
  TicketRegimenItemRepository,
  TicketRegimenRepository,
  TicketRepository,
  WalletRepository,
} from '../../repositories'
import { TicketChangeItemMoneyManager } from './ticket-change-item-money.manager'

export type PaymentTicketItemDto = Pick<
  PaymentTicketItem,
  | 'ticketItemType'
  | 'ticketItemId'
  | 'interactId'
  | 'expectedPrice'
  | 'discountMoney'
  | 'discountPercent'
  | 'discountType'
  | 'actualPrice'
  | 'quantity'
  | 'sessionIndex'
  | 'paidMoney'
  | 'debtMoney'
>

export type PaymentTicketWaitDto = Pick<PaymentTicketItem, 'paidMoney'>

export type PaymentTicketSurchargeDto = Pick<PaymentTicketItem, 'paidMoney' | 'debtMoney'>
export type PaymentTicketDiscountDto = Pick<PaymentTicketItem, 'paidMoney' | 'debtMoney'>

export type PaymentTicketItemMapDtoType = {
  paymentWait: PaymentTicketWaitDto
  paymentDiscount: PaymentTicketDiscountDto
  paymentSurcharge: PaymentTicketSurchargeDto
  ticketRegimenBodyList: PaymentTicketItemDto[]
  ticketProcedureNoEffectBodyList: PaymentTicketItemDto[]
  ticketProcedureHasEffectBodyList: PaymentTicketItemDto[]
  ticketProductConsumableBodyList: PaymentTicketItemDto[]
  ticketProductPrescriptionBodyList: PaymentTicketItemDto[]
  ticketLaboratoryBodyList: PaymentTicketItemDto[]
  ticketRadiologyBodyList: PaymentTicketItemDto[]
}

export type TicketPaymentOperationPropType = {
  oid: number
  ticketId: string
  userId: number
  walletId: string
  paymentActionType: PaymentActionType
  time: number
  note: string
  paidTotal: number
  debtTotal: number
  hasPaymentItem: 0 | 1
  paymentTicketItemMapDto?: PaymentTicketItemMapDtoType
}

@Injectable()
export class TicketPaymentOperation {
  constructor(
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketPaymentDetailRepository: TicketPaymentDetailRepository,
    private customerRepository: CustomerRepository,
    private walletRepository: WalletRepository,
    private paymentRepository: PaymentRepository,
    private paymentTicketItemRepository: PaymentTicketItemRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketRegimenItemRepository: TicketRegimenItemRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketLaboratoryRepository: TicketLaboratoryRepository,
    private ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private ticketRadiologyRepository: TicketRadiologyRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async managerPaymentMoney(manager: EntityManager, props: TicketPaymentOperationPropType) {
    const {
      oid,
      ticketId,
      userId,
      paymentActionType,
      paidTotal,
      debtTotal,
      hasPaymentItem,
      paymentTicketItemMapDto,
      time,
      note,
    } = props
    const walletId = props.walletId || '0'
    const PREFIX = `ticketId=${ticketId} startPayment failed`

    const ticketItemBodyList = [
      ...(paymentTicketItemMapDto?.ticketRegimenBodyList || []),
      ...(paymentTicketItemMapDto?.ticketProcedureNoEffectBodyList || []),
      ...(paymentTicketItemMapDto?.ticketProcedureHasEffectBodyList || []),
      ...(paymentTicketItemMapDto?.ticketProductConsumableBodyList || []),
      ...(paymentTicketItemMapDto?.ticketProductPrescriptionBodyList || []),
      ...(paymentTicketItemMapDto?.ticketLaboratoryBodyList || []),
      ...(paymentTicketItemMapDto?.ticketRadiologyBodyList || []),
    ]

    // if (paidAdd + paidItemAdd == 0 && debtAdd + debtItemAdd < 0) {
    //   throw new BusinessError(PREFIX, 'Số tiền thanh toán phải > 0')
    // }

    // === 1. TICKET: Update status để tạo transaction ===
    const ticketUpdated = await this.ticketRepository.managerUpdateOne(
      manager,
      {
        oid,
        id: ticketId,
        status: {
          IN: [
            TicketStatus.Draft,
            TicketStatus.Schedule,
            TicketStatus.Deposited,
            TicketStatus.Executing,
            TicketStatus.Debt,
          ],
        },
      },
      {
        paidTotal: () => `"paidTotal" + ${paidTotal}`,
        debtTotal: () => `"debtTotal" + ${debtTotal}`,
        status: () => ` CASE
                            WHEN("status" = ${TicketStatus.Draft}) THEN ${TicketStatus.Deposited} 
                            WHEN("status" = ${TicketStatus.Schedule}) THEN ${TicketStatus.Deposited} 
                            WHEN("status" = ${TicketStatus.Deposited}) THEN ${TicketStatus.Deposited} 
                            WHEN("status" = ${TicketStatus.Executing}) THEN ${TicketStatus.Executing} 
                            WHEN("status" = ${TicketStatus.Debt} AND "paidTotal" + ${paidTotal} = "totalMoney") 
                              THEN ${TicketStatus.Completed} 
                            WHEN("status" = ${TicketStatus.Debt} AND "paidTotal" +${paidTotal} < "totalMoney") 
                              THEN ${TicketStatus.Debt} 
                            ELSE "status"
                        END`,
      }
    )

    if (ticketUpdated.status === TicketStatus.Debt) {
      if (ticketUpdated.paidTotal >= ticketUpdated.totalMoney) {
        throw new BusinessError(PREFIX, 'Số tiền thanh toán không đúng')
      }
      if (ticketUpdated.paidTotal + ticketUpdated.debtTotal != ticketUpdated.totalMoney) {
        throw new BusinessError(PREFIX, 'Số tiền nợ không đúng')
      }
    }
    if (ticketUpdated.debtTotal < 0) {
      throw new BusinessError(PREFIX, 'Số tiền trả nợ không đúng')
    }

    const { customerId } = ticketUpdated
    let ticketPaymentDetailModified: TicketPaymentDetail

    if (hasPaymentItem) {
      const paidWait = paymentTicketItemMapDto?.paymentWait.paidMoney || 0
      const paidDiscount = paymentTicketItemMapDto?.paymentDiscount.paidMoney || 0
      const debtDiscount = paymentTicketItemMapDto?.paymentDiscount.debtMoney || 0
      const paidSurcharge = paymentTicketItemMapDto?.paymentSurcharge.paidMoney || 0
      const debtSurcharge = paymentTicketItemMapDto?.paymentSurcharge.debtMoney || 0

      const paidItemReduce = ticketItemBodyList.reduce((acc, item) => {
        return acc + item.paidMoney
      }, 0)
      const debtItemReduce = ticketItemBodyList.reduce((acc, item) => {
        return acc + item.debtMoney
      }, 0)

      if (
        paidTotal !== paidItemReduce + paidWait + paidDiscount + paidSurcharge
        || debtTotal !== debtItemReduce + debtDiscount + debtSurcharge
      ) {
        throw new BusinessError(PREFIX, 'Số tiền thanh toán trong Item không đúng', {
          paidTotal,
          debtTotal,
        })
      }

      ticketPaymentDetailModified = await this.ticketPaymentDetailRepository.managerUpdateOne(
        manager,
        { oid, ticketId, id: ticketId },
        {
          paidWait: () => `"paidWait" + ${paidWait}`,
          paidDiscount: () => `"paidDiscount" + ${paidDiscount}`,
          paidSurcharge: () => `"paidSurcharge" + ${paidSurcharge}`,
          paidItem: () => `"paidItem" + ${paidItemReduce}`,
          debtDiscount: () => `"debtDiscount" + ${debtDiscount}`,
          debtSurcharge: () => `"debtSurcharge" + ${debtSurcharge}`,
          debtItem: () => `"debtItem" + ${debtItemReduce}`,
        }
      )
    }

    let customerModified: Customer
    let walletOpenMoney = 0
    let walletCloseMoney = 0
    let customerOpenDebt = 0
    let customerCloseDebt = 0

    if (debtTotal != 0) {
      customerModified = await this.customerRepository.managerUpdateOne(
        manager,
        { oid, id: customerId },
        { updatedAt: time, debt: () => `debt + ${debtTotal}` }
      )
      customerOpenDebt = customerModified.debt - debtTotal
      customerCloseDebt = customerModified.debt
    } else {
      customerModified = await this.customerRepository.managerFindOneBy(manager, {
        oid,
        id: customerId,
      })
      customerOpenDebt = customerModified.debt
      customerCloseDebt = customerModified.debt
    }

    if (paidTotal) {
      if (walletId && walletId !== '0') {
        const walletModified = await this.walletRepository.managerUpdateOne(
          manager,
          { oid, id: walletId },
          { money: () => `money + ${paidTotal}` }
        )
        walletCloseMoney = walletModified.money
        walletOpenMoney = walletModified.money - paidTotal
      } else {
        // validate wallet
        const walletList = await this.walletRepository.managerFindManyBy(manager, { oid })
        if (walletList.length) {
          throw new BusinessError(PREFIX, 'Chưa chọn phương thức thanh toán')
        }
      }
    }

    let moneyDirection = MoneyDirection.Other
    if (paidTotal > 0) {
      moneyDirection = MoneyDirection.In
    }
    if (paidTotal < 0) {
      moneyDirection = MoneyDirection.Out
    }

    const paymentInsert: PaymentInsertType = {
      oid,
      voucherType: PaymentVoucherType.Ticket,
      voucherId: ticketId,
      personType: PaymentPersonType.Customer,
      personId: customerId,

      cashierId: userId,
      walletId,
      createdAt: time,
      paymentActionType,
      moneyDirection,
      note,

      hasPaymentItem,
      paidTotal,
      debtTotal,
      personOpenDebt: customerOpenDebt,
      personCloseDebt: customerCloseDebt,
      walletOpenMoney,
      walletCloseMoney,
    }

    const paymentCreated = await this.paymentRepository.managerInsertOne(manager, paymentInsert)

    if (hasPaymentItem) {
      const paymentTicketItemInsertList = ticketItemBodyList.map((i) => {
        const inserter: PaymentTicketItemInsertType = {
          oid,
          paymentId: paymentCreated.id,

          ticketId,
          ticketItemType: i.ticketItemType,
          ticketItemId: i.ticketItemId,
          interactId: i.interactId,

          expectedPrice: i.expectedPrice,
          discountMoney: i.discountMoney,
          discountPercent: i.discountPercent,
          discountType: i.discountType,
          actualPrice: i.actualPrice,
          quantity: i.quantity,
          sessionIndex: i.sessionIndex,
          paidMoney: i.paidMoney,
          debtMoney: i.debtMoney,
        }
        return inserter
      })
      if (
        paymentTicketItemMapDto.paymentWait
        && paymentTicketItemMapDto.paymentWait.paidMoney !== 0
      ) {
        const inserter: PaymentTicketItemInsertType = {
          oid,
          paymentId: paymentCreated.id,

          ticketId,
          ticketItemType: TicketItemType.WAIT,
          ticketItemId: '0',
          interactId: 0,

          expectedPrice: 0,
          discountMoney: 0,
          discountPercent: 0,
          discountType: DiscountType.Percent,
          actualPrice: 0,
          quantity: 1,
          sessionIndex: 0,
          paidMoney: paymentTicketItemMapDto.paymentWait.paidMoney,
          debtMoney: 0,
        }
        paymentTicketItemInsertList.push(inserter)
      }
      if (
        paymentTicketItemMapDto.paymentSurcharge
        && (paymentTicketItemMapDto.paymentSurcharge.paidMoney !== 0
          || paymentTicketItemMapDto.paymentSurcharge.debtMoney !== 0)
      ) {
        const inserter: PaymentTicketItemInsertType = {
          oid,
          paymentId: paymentCreated.id,

          ticketId,
          ticketItemType: TicketItemType.Surcharge,
          ticketItemId: '0',
          interactId: 0,

          expectedPrice: 0,
          discountMoney: 0,
          discountPercent: 0,
          discountType: DiscountType.Percent,
          actualPrice: 0,
          quantity: 1,
          sessionIndex: 0,
          paidMoney: paymentTicketItemMapDto.paymentSurcharge.paidMoney,
          debtMoney: paymentTicketItemMapDto.paymentSurcharge.debtMoney,
        }
        paymentTicketItemInsertList.push(inserter)
      }
      if (
        paymentTicketItemMapDto.paymentDiscount
        && (paymentTicketItemMapDto.paymentDiscount.paidMoney !== 0
          || paymentTicketItemMapDto.paymentDiscount.debtMoney !== 0)
      ) {
        const inserter: PaymentTicketItemInsertType = {
          oid,
          paymentId: paymentCreated.id,

          ticketId,
          ticketItemType: TicketItemType.Discount,
          ticketItemId: '0',
          interactId: 0,

          expectedPrice: 0,
          discountMoney: 0,
          discountPercent: 0,
          discountType: DiscountType.Percent,
          actualPrice: 0,
          quantity: 1,
          sessionIndex: 0,
          paidMoney: paymentTicketItemMapDto.paymentDiscount.paidMoney,
          debtMoney: paymentTicketItemMapDto.paymentDiscount.debtMoney,
        }
        paymentTicketItemInsertList.push(inserter)
      }
      await this.paymentTicketItemRepository.managerInsertMany(manager, paymentTicketItemInsertList)
    }

    // === START: Cập nhật thanh toán vào item ===
    const ticketRegimenModifiedList = await this.ticketRegimenRepository.managerBulkUpdate({
      manager,
      condition: { oid, ticketId },
      compare: { id: { cast: 'bigint' } },
      tempList: (paymentTicketItemMapDto?.ticketRegimenBodyList || []).map((i) => ({
        ...i,
        id: i.ticketItemId,
        paidAdd: i.paidMoney,
        debtAdd: i.debtMoney,
      })),
      update: {
        paid: () => `"paid" + "paidAdd"`,
        debt: () => `"debt" + "debtAdd"`,
      },
      options: { requireEqualLength: true },
    })

    const ticketProcedureNoEffectModifiedList =
      await this.ticketProcedureRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: PaymentMoneyStatus.NoEffect },
        compare: { id: { cast: 'bigint' } },
        tempList: (paymentTicketItemMapDto?.ticketProcedureNoEffectBodyList || []).map((i) => ({
          ...i,
          id: i.ticketItemId,
          paidAdd: i.paidMoney,
          debtAdd: i.debtMoney,
        })),
        update: {
          paid: () => `"paid" + "paidAdd"`,
          debt: () => `"debt" + "debtAdd"`,
          paymentMoneyStatus: (t: string, u: string) => {
            return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."quantity" * "${u}"."actualPrice" 
                            AND "debt" + "debtAdd" = 0) THEN ${PaymentMoneyStatus.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."quantity" * "${u}"."actualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${PaymentMoneyStatus.PartialPaid} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" > 0) 
                            THEN ${PaymentMoneyStatus.Debt} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" = 0) 
                            THEN ${PaymentMoneyStatus.PendingPayment} 
                          ELSE "paymentMoneyStatus"
                      END`
          },
        },
        options: { requireEqualLength: true },
      })

    const ticketProcedureHasEffectModifiedList =
      await this.ticketProcedureRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId, paymentMoneyStatus: { NOT: PaymentMoneyStatus.NoEffect } },
        compare: { id: { cast: 'bigint' } },
        tempList: (paymentTicketItemMapDto?.ticketProcedureHasEffectBodyList || []).map((i) => ({
          ...i,
          id: i.ticketItemId,
          paidAdd: i.paidMoney,
          debtAdd: i.debtMoney,
        })),
        update: {
          paid: () => `"paid" + "paidAdd"`,
          debt: () => `"debt" + "debtAdd"`,
          paymentMoneyStatus: (t: string, u: string) => {
            return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."quantity" * "${u}"."actualPrice" 
                            AND "debt" + "debtAdd" = 0) THEN ${PaymentMoneyStatus.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."quantity" * "${u}"."actualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${PaymentMoneyStatus.PartialPaid} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" > 0) 
                            THEN ${PaymentMoneyStatus.Debt} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" = 0) 
                            THEN ${PaymentMoneyStatus.PendingPayment} 
                          ELSE "paymentMoneyStatus"
                      END`
          },
        },
        options: { requireEqualLength: true },
      })

    const ticketProductModifiedList = await this.ticketProductRepository.managerBulkUpdate({
      manager,
      condition: { oid, ticketId },
      compare: { id: { cast: 'bigint' } },
      tempList: [
        ...(paymentTicketItemMapDto?.ticketProductConsumableBodyList || []),
        ...(paymentTicketItemMapDto?.ticketProductPrescriptionBodyList || []),
      ].map((i) => ({
        ...i,
        id: i.ticketItemId,
        paidAdd: i.paidMoney,
        debtAdd: i.debtMoney,
      })),
      update: {
        paid: () => `"paid" + "paidAdd"`,
        debt: () => `"debt" + "debtAdd"`,
        paymentMoneyStatus: (t: string, u: string) => {
          return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."quantity" * "${u}"."actualPrice" 
                            AND "debt" + "debtAdd" = 0) THEN ${PaymentMoneyStatus.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."quantity" * "${u}"."actualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${PaymentMoneyStatus.PartialPaid} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" > 0) 
                            THEN ${PaymentMoneyStatus.Debt} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" = 0) 
                            THEN ${PaymentMoneyStatus.PendingPayment} 
                          ELSE "paymentMoneyStatus"
                      END`
        },
      },
      options: { requireEqualLength: true },
    })

    const ticketLaboratoryModifiedList = await this.ticketLaboratoryRepository.managerBulkUpdate({
      manager,
      condition: { oid, ticketId },
      compare: { id: { cast: 'bigint' } },
      tempList: (paymentTicketItemMapDto?.ticketLaboratoryBodyList || []).map((i) => ({
        ...i,
        id: i.ticketItemId,
        paidAdd: i.paidMoney,
        debtAdd: i.debtMoney,
      })),
      update: {
        paid: () => `"paid" + "paidAdd"`,
        debt: () => `"debt" + "debtAdd"`,
        paymentMoneyStatus: (t: string, u: string) => {
          return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."actualPrice" 
                            AND "debt" + "debtAdd" = 0) THEN ${PaymentMoneyStatus.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."actualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${PaymentMoneyStatus.PartialPaid} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" > 0) 
                            THEN ${PaymentMoneyStatus.Debt} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" = 0) 
                            THEN ${PaymentMoneyStatus.PendingPayment} 
                          ELSE "paymentMoneyStatus"
                      END`
        },
      },
      options: { requireEqualLength: true },
    })

    const ticketRadiologyModifiedList = await this.ticketRadiologyRepository.managerBulkUpdate({
      manager,
      condition: { oid, ticketId },
      compare: { id: { cast: 'bigint' } },
      tempList: (paymentTicketItemMapDto?.ticketRadiologyBodyList || []).map((i) => ({
        ...i,
        id: i.ticketItemId,
        paidAdd: i.paidMoney,
        debtAdd: i.debtMoney,
      })),
      update: {
        paid: () => `"paid" + "paidAdd"`,
        debt: () => `"debt" + "debtAdd"`,
        paymentMoneyStatus: (t: string, u: string) => {
          return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."actualPrice" 
                            AND "debt" + "debtAdd" = 0) THEN ${PaymentMoneyStatus.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."actualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${PaymentMoneyStatus.PartialPaid} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" > 0) 
                            THEN ${PaymentMoneyStatus.Debt} 
                          WHEN("paid" + "paidAdd" = 0 AND "debt" + "debtAdd" = 0) 
                            THEN ${PaymentMoneyStatus.PendingPayment} 
                          ELSE "paymentMoneyStatus"
                      END`
        },
      },
      options: { requireEqualLength: true },
    })

    // === Validate Update
    const validate = [
      ...ticketProcedureNoEffectModifiedList,
      ...ticketProcedureHasEffectModifiedList,
      ...ticketProductModifiedList,
      ...ticketLaboratoryModifiedList,
      ...ticketRadiologyModifiedList,
    ].forEach((i) => {
      const quantity = i['quantity'] || 1
      if (i.paid + i.debt > quantity * i.actualPrice) {
        throw new BusinessError(PREFIX, i, 'i.paid + i.debt > i.quantity * i.actualPrice')
      }
      if (i.paid < 0) throw new BusinessError(PREFIX, 'i.paid < 0')
      if (i.debt < 0) throw new BusinessError(PREFIX, 'i.debt < 0')
    })

    // === Update lại TicketProcedureNoEffect => Từ NoEffect sang HasEffect thì thay đổi Actual
    let ticketModified = ticketUpdated
    let ticketRegimenItemModifiedList: TicketRegimenItem[] = []
    let ticketRegimenFixList: TicketRegimen[] = []

    if (ticketProcedureNoEffectModifiedList.length) {
      const procedureMoneyAdd = ticketProcedureNoEffectModifiedList.reduce((acc, item) => {
        return acc + item.quantity * item.actualPrice
      }, 0)
      if (procedureMoneyAdd !== 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin: ticketModified,
          itemMoney: {
            procedureMoneyAdd,
          },
        })
      }
    }

    if (ticketProcedureNoEffectModifiedList.length) {
      const triIdList = ticketProcedureNoEffectModifiedList
        .map((i) => i.ticketRegimenItemId)
        .filter((i) => !!i && i !== '0')
      const triUpdateList = ESArray.uniqueArray(triIdList).map((triId) => {
        const tpList = ticketProcedureNoEffectModifiedList.filter((i) => {
          return i.ticketRegimenItemId === triId
        })
        return {
          id: triId,
          quantityActual: tpList.reduce((acc, item) => {
            return acc + item.quantity
          }, 0),
          moneyAmountActual: tpList.reduce((acc, item) => {
            return acc + item.quantity * item.actualPrice
          }, 0),
        }
      })
      ticketRegimenItemModifiedList = await this.ticketRegimenItemRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId },
        compare: { id: { cast: 'bigint' } },
        tempList: triUpdateList,
        update: {
          quantityActual: (t: string, u: string) => {
            return `"${u}"."quantityActual" + "${t}"."quantityActual"`
          },
          moneyAmountActual: (t: string, u: string) => {
            return `"${u}"."moneyAmountActual" + "${t}"."moneyAmountActual"`
          },
        },
        options: { requireEqualLength: true },
      })
    }

    if (ticketProcedureNoEffectModifiedList.length || ticketProcedureHasEffectModifiedList.length) {
      const trIdList = [
        ...(ticketProcedureNoEffectModifiedList || []),
        ...(ticketProcedureHasEffectModifiedList || []),
      ]
        .map((i) => i.ticketRegimenId)
        .filter((i) => !!i && i !== '0')
      const trIdListUnique = ESArray.uniqueArray(trIdList)
      const trUpdateList = trIdListUnique.map((trId) => {
        const tpNoEffectList = ticketProcedureNoEffectModifiedList
          .filter((i) => i.ticketRegimenId === trId)
          .map((i) => {
            return {
              moneyAmountActualAdd: i.quantity * i.actualPrice,
              paidItemAdd: i.paid,
              debtItemAdd: i.debt,
            }
          })
        const tpHasEffectList = ticketProcedureHasEffectModifiedList
          .filter((i) => i.ticketRegimenId === trId)
          .map((i) => {
            const tpBody = paymentTicketItemMapDto.ticketProcedureHasEffectBodyList.find((j) => {
              return j.ticketItemId === i.id
            })
            return {
              paidItemAdd: tpBody.paidMoney,
              debtItemAdd: tpBody.debtMoney,
            }
          })
        return {
          id: trId,
          moneyAmountActualAdd: tpNoEffectList.reduce((acc, item) => {
            return acc + item.moneyAmountActualAdd
          }, 0),
          paidItemAdd: [...tpNoEffectList, ...tpHasEffectList].reduce((acc, item) => {
            return acc + item.paidItemAdd
          }, 0),
          debtItemAdd: [...tpNoEffectList, ...tpHasEffectList].reduce((acc, item) => {
            return acc + item.debtItemAdd
          }, 0),
        }
      })
      ticketRegimenFixList = await this.ticketRegimenRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId },
        compare: { id: { cast: 'bigint' } },
        tempList: trUpdateList,
        update: {
          moneyAmountActual: (t: string, u: string) => {
            return `"${u}"."moneyAmountActual" + "${t}"."moneyAmountActualAdd"`
          },
          paidItem: (t: string, u: string) => {
            return `"${u}"."paidItem" + "${t}"."paidItemAdd"`
          },
          debtItem: (t: string, u: string) => {
            return `"${u}"."debtItem" + "${t}"."debtItemAdd"`
          },
        },
        options: { requireEqualLength: true },
      })
    }

    // === Update lại TicketLaboratoryGroup
    let ticketLaboratoryGroupModifiedList: TicketLaboratoryGroup[] = []
    if (ticketLaboratoryModifiedList.length) {
      const tlgIdList = ticketLaboratoryModifiedList.map((i) => i.ticketLaboratoryGroupId)
      const tlgIdListUnique = ESArray.uniqueArray(tlgIdList)
      const ticketLaboratoryList = await this.ticketLaboratoryRepository.managerFindManyBy(
        manager,
        { oid, ticketLaboratoryGroupId: { IN: tlgIdListUnique } }
      )

      const tlgUpdateList = tlgIdListUnique
        .filter((i) => !!i && i != '0')
        .map((tlgId) => {
          const tlList = ticketLaboratoryList.filter((i) => i.ticketLaboratoryGroupId === tlgId)
          const { paymentMoneyStatus } = TicketLaboratoryGroup.calculatorPaymentMoneyStatus({
            ticketLaboratoryList: tlList,
          })
          return {
            id: tlgId,
            paymentMoneyStatus,
          }
        })
      ticketLaboratoryGroupModifiedList =
        await this.ticketLaboratoryGroupRepository.managerBulkUpdate({
          manager,
          compare: { id: { cast: 'bigint' } },
          condition: { oid },
          tempList: tlgUpdateList,
          update: ['paymentMoneyStatus'],
          options: { requireEqualLength: true },
        })
    }

    return {
      ticketModified,
      ticketPaymentDetailModified,
      customerModified,
      paymentCreated,
      ticketRegimentList: [...ticketRegimenModifiedList, ...ticketRegimenFixList],
      ticketRegimenItemModifiedList,
      ticketProcedureModifiedList: [
        ...ticketProcedureNoEffectModifiedList,
        ...ticketProcedureHasEffectModifiedList,
      ],
      ticketProductModifiedList,
      ticketLaboratoryModifiedList,
      ticketRadiologyModifiedList,
      ticketLaboratoryGroupModifiedList,
    }
  }

  async startPaymentMoney(prop: TicketPaymentOperationPropType) {
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const managerPayment = await this.managerPaymentMoney(manager, prop)
      return managerPayment
    })

    return transaction
  }

  async startPaymentMoneyList(propList: TicketPaymentOperationPropType[]) {
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const managerPaymentList: Awaited<ReturnType<typeof this.managerPaymentMoney>>[] = []
      for (let i = 0; i < propList.length; i++) {
        const prop = propList[i]
        const managerPayment = await this.managerPaymentMoney(manager, prop)
        managerPaymentList.push(managerPayment)
      }
      return managerPaymentList
    })

    return transaction
  }
}
