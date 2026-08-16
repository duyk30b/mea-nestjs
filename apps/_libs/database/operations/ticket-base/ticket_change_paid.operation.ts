import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers'
import { BusinessError } from '../../common/error'
import { DiscountType, TicketActionType, TicketItemPaymentType } from '../../common/variable'
import {
  TicketLaboratoryGroup,
  TicketPaymentDetail,
  TicketRegimen,
  TicketRegimenItem,
} from '../../entities'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
} from '../../entities/payment.entity'
import PaymentTicket, {
  PaymentTicketInsertType,
  PaymentTicketItemType,
} from '../../entities/payment_ticket.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  CustomerRepository,
  PaymentRepository,
  PaymentTicketRepository,
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

export type PaymentTicketDto = Pick<
  PaymentTicket,
  | 'paymentTicketItemType'
  | 'ticketItemId'
  | 'ticketItemInteractId'
  | 'sessionIndex'
  | 'expectedPrice'
  | 'discountType'
  | 'discountMoney'
  | 'discountPercent'
  | 'actualPrice'
  | 'quantity'
  | 'unitRate'
  | 'paidMoney'
>

export type PaymentTicketWaitDto = Pick<PaymentTicket, 'paidMoney'>

export type PaymentTicketSurchargeDto = Pick<PaymentTicket, 'paidMoney'>
export type PaymentTicketDiscountDto = Pick<PaymentTicket, 'paidMoney'>

export type PaymentTicketItemMapType = {
  paymentWait: PaymentTicketWaitDto
  paymentDiscount: PaymentTicketDiscountDto
  paymentSurcharge: PaymentTicketSurchargeDto
  paymentTicketRegimenList: PaymentTicketDto[]
  paymentTicketProcedureNoEffectList: PaymentTicketDto[]
  paymentTicketProcedureHasEffectList: PaymentTicketDto[]
  paymentTicketProductConsumableList: PaymentTicketDto[]
  paymentTicketProductPrescriptionList: PaymentTicketDto[]
  paymentTicketLaboratoryList: PaymentTicketDto[]
  paymentTicketRadiologyList: PaymentTicketDto[]
}

@Injectable()
export class TicketPaymentMoneyOperation {
  constructor(
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketPaymentDetailRepository: TicketPaymentDetailRepository,
    private customerRepository: CustomerRepository,
    private walletRepository: WalletRepository,
    private paymentRepository: PaymentRepository,
    private paymentTicketRepository: PaymentTicketRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketRegimenItemRepository: TicketRegimenItemRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketLaboratoryRepository: TicketLaboratoryRepository,
    private ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private ticketRadiologyRepository: TicketRadiologyRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) {}

  // thanh toán mà không ảnh hưởng đến nợ
  async startPaymentMoney(props: {
    oid: number
    ticketId: string
    cashierId: number
    walletId: string
    paymentActionType: PaymentActionType
    ticketActionType: TicketActionType
    paidTotal: number
    isPaymentEachItem: 0 | 1
    paymentTicketItemMap?: PaymentTicketItemMapType // trường hợp trả tiền vào item thì chọn options này
    note: string
    time: number
  }) {
    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const {
        oid,
        cashierId,
        paymentActionType,
        time,
        note,
        paidTotal,
        ticketId,
        ticketActionType,
        isPaymentEachItem,
        paymentTicketItemMap, // dùng cho trường hợp trả tiền vào item, isPaymentEachItem = 1
      } = props
      const walletId = props.walletId || '0'
      const PREFIX = `ticketId=${ticketId} startPayment failed`

      const ticketPaymentItemBodyList = [
        ...(paymentTicketItemMap?.paymentTicketRegimenList || []),
        ...(paymentTicketItemMap?.paymentTicketProcedureNoEffectList || []),
        ...(paymentTicketItemMap?.paymentTicketProcedureHasEffectList || []),
        ...(paymentTicketItemMap?.paymentTicketProductConsumableList || []),
        ...(paymentTicketItemMap?.paymentTicketProductPrescriptionList || []),
        ...(paymentTicketItemMap?.paymentTicketLaboratoryList || []),
        ...(paymentTicketItemMap?.paymentTicketRadiologyList || []),
      ]

      ticketPaymentItemBodyList.forEach((i) => {
        if (i.paidMoney == 0) {
          throw new BusinessError(PREFIX, 'Số tiền thanh toán trong PaymentTicketMap phải != 0')
        }
      })

      // === 1. TICKET: Update status để tạo transaction ===
      const ticketUpdated = await this.ticketRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: ticketId,
          status: {
            IN: [TicketStatus.Draft, TicketStatus.Schedule, TicketStatus.Executing],
          },
        },
        {
          paidTotal: () => `"paidTotal" + ${paidTotal}`,
          status: () => ` CASE
                            WHEN("status" = ${TicketStatus.Draft}) THEN ${TicketStatus.Schedule} 
                            ELSE "status"
                        END`,
        }
      )

      const { customerId } = ticketUpdated
      let ticketPaymentDetailModified: TicketPaymentDetail
      if (isPaymentEachItem) {
        const paidWait = paymentTicketItemMap?.paymentWait.paidMoney || 0
        const paidDiscount = paymentTicketItemMap?.paymentDiscount.paidMoney || 0
        const paidSurcharge = paymentTicketItemMap?.paymentSurcharge.paidMoney || 0
        const paidItemReduce = ticketPaymentItemBodyList.reduce((acc, item) => {
          return acc + item.paidMoney
        }, 0)

        if (paidTotal !== paidWait + paidDiscount + paidSurcharge + paidItemReduce) {
          throw new BusinessError(PREFIX, 'Số tiền thanh toán trong PaymentTicketMap không đúng', {
            paidTotal,
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
          }
        )
      }

      const customerModified = await this.customerRepository.managerFindOneBy(manager, {
        oid,
        id: customerId,
      })
      const customerOpenDebt = customerModified.debt
      const customerCloseDebt = customerModified.debt
      let walletOpenMoney = 0
      let walletCloseMoney = 0

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

      let moneyDirection = MoneyDirection.Other
      if (paidTotal > 0) {
        moneyDirection = MoneyDirection.In
      } else if (paidTotal < 0) {
        moneyDirection = MoneyDirection.Out
      }

      const paymentCreated = await this.paymentRepository.managerInsertOne(manager, {
        oid,
        personType: PaymentPersonType.Customer,
        personId: customerId,

        cashierId,
        walletId,
        paymentActionType,
        moneyDirection,
        note,
        createdAt: time,

        paidTotal,
        debtTotal: 0,
        personOpenDebt: customerOpenDebt,
        personCloseDebt: customerCloseDebt,
        walletOpenMoney,
        walletCloseMoney,
      } satisfies PaymentInsertType)

      const paymentTicketItemInsertList: PaymentTicketInsertType[] = []
      if (!isPaymentEachItem) {
        // Trường hợp thanh toán vào phiếu
        paymentTicketItemInsertList.push({
          oid,
          paymentId: paymentCreated.id,
          ticketId,
          ticketActionType,
          paymentTicketItemType: PaymentTicketItemType.Unknown,
          ticketItemId: '0',
          ticketItemInteractId: 0,
          sessionIndex: 0,

          expectedPrice: 0,
          discountType: DiscountType.Percent,
          discountMoney: 0,
          discountPercent: 0,
          actualPrice: 0,
          quantity: 1,
          unitRate: 1,
          paidMoney: paidTotal,
          debtMoney: 0,
          createdAt: time,
        } satisfies PaymentTicketInsertType)
      }

      if (isPaymentEachItem) {
        if (ticketPaymentItemBodyList.length !== 0) {
          ticketPaymentItemBodyList.forEach((i) => {
            paymentTicketItemInsertList.push({
              oid,
              paymentId: paymentCreated.id,
              ticketId,
              ticketActionType,
              paymentTicketItemType: i.paymentTicketItemType,
              ticketItemId: i.ticketItemId,
              ticketItemInteractId: i.ticketItemInteractId,
              sessionIndex: i.sessionIndex,

              expectedPrice: i.expectedPrice,
              discountType: i.discountType,
              discountMoney: i.discountMoney,
              discountPercent: i.discountPercent,
              actualPrice: i.actualPrice,
              quantity: i.quantity,
              unitRate: i.unitRate,
              paidMoney: i.paidMoney,
              debtMoney: 0,
              createdAt: time,
            } satisfies PaymentTicketInsertType)
          })
        }

        if (paymentTicketItemMap.paymentWait && paymentTicketItemMap.paymentWait.paidMoney !== 0) {
          paymentTicketItemInsertList.push({
            oid,
            paymentId: paymentCreated.id,

            ticketId,
            ticketActionType,
            paymentTicketItemType: PaymentTicketItemType.WAIT,
            ticketItemId: '0',
            ticketItemInteractId: 0,

            expectedPrice: 0,
            discountMoney: 0,
            discountPercent: 0,
            discountType: DiscountType.Percent,
            actualPrice: 0,
            quantity: 1,
            unitRate: 1,
            sessionIndex: 0,
            paidMoney: paymentTicketItemMap.paymentWait.paidMoney,
            debtMoney: 0,
            createdAt: time,
          } satisfies PaymentTicketInsertType)
        }
        if (
          paymentTicketItemMap.paymentSurcharge
          && paymentTicketItemMap.paymentSurcharge.paidMoney !== 0
        ) {
          paymentTicketItemInsertList.push({
            oid,
            paymentId: paymentCreated.id,

            ticketId,
            ticketActionType,
            paymentTicketItemType: PaymentTicketItemType.Surcharge,
            ticketItemId: '0',
            ticketItemInteractId: 0,

            expectedPrice: 0,
            discountMoney: 0,
            discountPercent: 0,
            discountType: DiscountType.Percent,
            actualPrice: 0,
            quantity: 1,
            unitRate: 1,
            sessionIndex: 0,
            paidMoney: paymentTicketItemMap.paymentSurcharge.paidMoney,
            debtMoney: 0,
            createdAt: time,
          } satisfies PaymentTicketInsertType)
        }
        if (
          paymentTicketItemMap.paymentDiscount
          && paymentTicketItemMap.paymentDiscount.paidMoney !== 0
        ) {
          paymentTicketItemInsertList.push({
            oid,
            paymentId: paymentCreated.id,

            ticketId,
            ticketActionType,
            paymentTicketItemType: PaymentTicketItemType.Discount,
            ticketItemId: '0',
            ticketItemInteractId: 0,

            expectedPrice: 0,
            discountMoney: 0,
            discountPercent: 0,
            discountType: DiscountType.Percent,
            actualPrice: 0,
            quantity: 1,
            unitRate: 1,
            sessionIndex: 0,
            paidMoney: paymentTicketItemMap.paymentDiscount.paidMoney,
            debtMoney: 0,
            createdAt: time,
          } satisfies PaymentTicketInsertType)
        }
      }

      const paymentTicketCreatedList = await this.paymentTicketRepository.managerInsertMany(
        manager,
        paymentTicketItemInsertList
      )

      // === START: Cập nhật thanh toán vào item ===
      const ticketRegimenModifiedList = await this.ticketRegimenRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId },
        compare: { id: { cast: 'bigint' } },
        tempList: (paymentTicketItemMap?.paymentTicketRegimenList || []).map((i) => ({
          ...i,
          id: i.ticketItemId,
          paidAdd: i.paidMoney,
        })),
        update: {
          paid: () => `"paid" + "paidAdd"`,
        },
        options: { requireEqualLength: true },
      })

      const ticketProcedureNoEffectModifiedList =
        await this.ticketProcedureRepository.managerBulkUpdate({
          manager,
          condition: { oid, ticketId, ticketItemPaymentType: TicketItemPaymentType.NoEffect },
          compare: { id: { cast: 'bigint' } },
          tempList: (paymentTicketItemMap?.paymentTicketProcedureNoEffectList || []).map((i) => ({
            ...i,
            id: i.ticketItemId,
            paidAdd: i.paidMoney,
          })),
          update: {
            paid: () => `"paid" + "paidAdd"`,
            ticketItemPaymentType: (t: string, u: string) => {
              return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."quantity" * "${u}"."actualPrice") 
                            THEN ${TicketItemPaymentType.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."quantity" * "${u}"."actualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${TicketItemPaymentType.PartialPaid} 
                          WHEN "paid" + "paidAdd" = 0 THEN ${TicketItemPaymentType.PendingPayment} 
                          ELSE "ticketItemPaymentType"
                      END`
            },
          },
          options: { requireEqualLength: true },
        })

      const ticketProcedureHasEffectModifiedList =
        await this.ticketProcedureRepository.managerBulkUpdate({
          manager,
          condition: {
            oid,
            ticketId,
            ticketItemPaymentType: { NOT: TicketItemPaymentType.NoEffect },
          },
          compare: { id: { cast: 'bigint' } },
          tempList: (paymentTicketItemMap?.paymentTicketProcedureHasEffectList || []).map((i) => ({
            ...i,
            id: i.ticketItemId,
            paidAdd: i.paidMoney,
          })),
          update: {
            paid: () => `"paid" + "paidAdd"`,
            ticketItemPaymentType: (t: string, u: string) => {
              return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."quantity" * "${u}"."actualPrice")
                            THEN ${TicketItemPaymentType.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."quantity" * "${u}"."actualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${TicketItemPaymentType.PartialPaid} 
                          WHEN("paid" + "paidAdd" = 0) THEN ${TicketItemPaymentType.PendingPayment} 
                          ELSE "ticketItemPaymentType"
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
          ...(paymentTicketItemMap?.paymentTicketProductConsumableList || []),
          ...(paymentTicketItemMap?.paymentTicketProductPrescriptionList || []),
        ].map((i) => ({
          ...i,
          id: i.ticketItemId,
          paidAdd: i.paidMoney,
        })),
        update: {
          paid: () => `"paid" + "paidAdd"`,
          ticketItemPaymentType: (t: string, u: string) => {
            return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."unitQuantity" * "${u}"."unitActualPrice")
                            THEN ${TicketItemPaymentType.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."unitQuantity" * "${u}"."unitActualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${TicketItemPaymentType.PartialPaid} 
                          WHEN("paid" + "paidAdd" = 0) THEN ${TicketItemPaymentType.PendingPayment} 
                          ELSE "ticketItemPaymentType"
                      END`
          },
        },
        options: { requireEqualLength: true },
      })

      const ticketLaboratoryModifiedList = await this.ticketLaboratoryRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId },
        compare: { id: { cast: 'bigint' } },
        tempList: (paymentTicketItemMap?.paymentTicketLaboratoryList || []).map((i) => ({
          ...i,
          id: i.ticketItemId,
          paidAdd: i.paidMoney,
        })),
        update: {
          paid: () => `"paid" + "paidAdd"`,
          ticketItemPaymentType: (t: string, u: string) => {
            return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."actualPrice") 
                            THEN ${TicketItemPaymentType.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."actualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${TicketItemPaymentType.PartialPaid} 
                          WHEN("paid" + "paidAdd" = 0) THEN ${TicketItemPaymentType.PendingPayment} 
                          ELSE "ticketItemPaymentType"
                      END`
          },
        },
        options: { requireEqualLength: true },
      })

      const ticketRadiologyModifiedList = await this.ticketRadiologyRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId },
        compare: { id: { cast: 'bigint' } },
        tempList: (paymentTicketItemMap?.paymentTicketRadiologyList || []).map((i) => ({
          ...i,
          id: i.ticketItemId,
          paidAdd: i.paidMoney,
        })),
        update: {
          paid: () => `"paid" + "paidAdd"`,
          ticketItemPaymentType: (t: string, u: string) => {
            return `CASE
                          WHEN("paid" + "paidAdd" = "${u}"."actualPrice") 
                            THEN ${TicketItemPaymentType.FullPaid} 
                          WHEN("paid" + "paidAdd" < "${u}"."actualPrice" 
                            AND "paid" + "paidAdd" > 0) THEN ${TicketItemPaymentType.PartialPaid} 
                          WHEN("paid" + "paidAdd" = 0) THEN ${TicketItemPaymentType.PendingPayment} 
                          ELSE "ticketItemPaymentType"
                      END`
          },
        },
        options: { requireEqualLength: true },
      })

      // === Validate Update
      const validate1 = [
        ...ticketProcedureNoEffectModifiedList,
        ...ticketProcedureHasEffectModifiedList,
        ...ticketLaboratoryModifiedList,
        ...ticketRadiologyModifiedList,
      ].forEach((i) => {
        const quantity = i['quantity'] || 1
        if (i.paid > quantity * i.actualPrice) {
          throw new BusinessError(PREFIX, 'i.paid  > i.quantity * i.actualPrice', i)
        }
        if (i.paid < 0) throw new BusinessError(PREFIX, 'i.paid < 0', i)
      })
      ticketProductModifiedList.forEach((i) => {
        if (i.paid > (i.quantity * i.unitActualPrice) / i.unitRate) {
          throw new BusinessError(
            PREFIX,
            'i.paid  > i.quantity * i.unitActualPrice / i.unitRate',
            i
          )
        }
        if (i.paid < 0) throw new BusinessError(PREFIX, 'i.paid < 0', i)
      })

      // === Update lại TicketProcedureNoEffect => Từ NoEffect sang HasEffect thì thay đổi Actual
      let ticketModified = ticketUpdated
      let ticketRegimenItemModifiedList: TicketRegimenItem[] = []
      let ticketRegimenFixList: TicketRegimen[] = []

      // cần sửa lại itemsActualMoney, totalMoney vì trước đó là NoEffect, bây giờ là HasEffect
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

      if (
        ticketProcedureNoEffectModifiedList.length
        || ticketProcedureHasEffectModifiedList.length
      ) {
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
              }
            })
          const tpHasEffectList = ticketProcedureHasEffectModifiedList
            .filter((i) => i.ticketRegimenId === trId)
            .map((i) => {
              const tpBody = paymentTicketItemMap.paymentTicketProcedureHasEffectList.find((j) => {
                return j.ticketItemId === i.id
              })
              return {
                paidItemAdd: tpBody.paidMoney,
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
            const { ticketItemPaymentType } = TicketLaboratoryGroup.calculatorTicketItemPaymentType(
              {
                ticketLaboratoryList: tlList,
              }
            )
            return {
              id: tlgId,
              ticketItemPaymentType,
            }
          })
        ticketLaboratoryGroupModifiedList =
          await this.ticketLaboratoryGroupRepository.managerBulkUpdate({
            manager,
            compare: { id: { cast: 'bigint' } },
            condition: { oid },
            tempList: tlgUpdateList,
            update: ['ticketItemPaymentType'],
            options: { requireEqualLength: true },
          })
      }

      paymentTicketCreatedList.forEach((i) => {
        i.payment = paymentCreated
      })

      return {
        ticketModified,
        customerModified,
        ticketPaymentDetailModified,
        paymentCreated,
        paymentTicketCreatedList,
        ticketRegimentList: [...ticketRegimenModifiedList, ...ticketRegimenFixList],
        ticketRegimenItemModifiedList,
        ticketProcedureModifiedList: [
          ...ticketProcedureNoEffectModifiedList,
          ...ticketProcedureHasEffectModifiedList,
        ],
        ticketProductModifiedList,
        ticketLaboratoryModifiedList,
        ticketLaboratoryGroupModifiedList,
        ticketRadiologyModifiedList,
      }
    })
    return transaction
  }
}
