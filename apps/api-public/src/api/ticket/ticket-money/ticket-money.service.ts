import { Injectable } from '@nestjs/common'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { TicketItemType } from '../../../../../_libs/database/entities/payment-ticket-item.entity'
import { PaymentActionType } from '../../../../../_libs/database/entities/payment.entity'
import { TicketProductType } from '../../../../../_libs/database/entities/ticket-product.entity'
import {
  PaymentTicketDiscountDto,
  PaymentTicketItemDto,
  PaymentTicketItemMapDtoType,
  PaymentTicketSurchargeDto,
  TicketPaymentOperation,
  TicketPaymentOperationPropType,
} from '../../../../../_libs/database/operations'
import {
  TicketLaboratoryRepository,
  TicketPaymentDetailRepository,
  TicketProcedureRepository,
  TicketProductRepository,
  TicketRadiologyRepository,
  TicketRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketPayDebtBody, TicketPaymentMoneyBody } from './request'

@Injectable()
export class TicketMoneyService {
  constructor(
    private socketEmitService: SocketEmitService,
    private ticketRepository: TicketRepository,
    private ticketPaymentDetailRepository: TicketPaymentDetailRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketLaboratoryRepository: TicketLaboratoryRepository,
    private ticketRadiologyRepository: TicketRadiologyRepository,
    private ticketPaymentOperation: TicketPaymentOperation
  ) { }

  async paymentMoney(data: {
    oid: number
    ticketId: string
    userId: number
    body: TicketPaymentMoneyBody
  }) {
    const { oid, ticketId, userId, body } = data
    const paymentResult = await this.ticketPaymentOperation.startPaymentMoney({
      oid,
      ticketId,
      userId,
      walletId: body.walletId,
      time: Date.now(),
      note: body.note,
      paymentActionType: body.paymentActionType,
      paidTotal: body.paidTotal,
      debtTotal: body.debtTotal,
      hasPaymentItem: body.hasPaymentItem,
      paymentTicketItemMapDto: body.paymentTicketItemMapDto,
    })
    const { ticketModified, customerModified, paymentCreated } = paymentResult

    this.socketEmitService.socketTicketChange(oid, {
      ticketId: paymentResult.ticketModified.id,
      ticketModified: paymentResult.ticketModified,
      ticketPaymentDetailModified: paymentResult.ticketPaymentDetailModified,
      ticketRegimen: { upsertedList: paymentResult.ticketRegimentList || [] },
      ticketRegimenItem: { upsertedList: paymentResult.ticketRegimenItemModifiedList || [] },
      ticketProcedure: { upsertedList: paymentResult.ticketProcedureModifiedList },
      ticketProduct: { upsertedList: paymentResult.ticketProductModifiedList },
      ticketLaboratory: { upsertedList: paymentResult.ticketLaboratoryModifiedList },
      ticketLaboratoryGroup: { upsertedList: paymentResult.ticketLaboratoryGroupModifiedList },
      ticketRadiology: { upsertedList: paymentResult.ticketRadiologyModifiedList },
    })
    this.socketEmitService.customerUpsert(oid, { customer: customerModified })

    return { ticketModified, customerModified, paymentCreated }
  }

  async payDebt(data: { oid: number; userId: number; body: TicketPayDebtBody }) {
    const { oid, userId, body } = data

    const totalMoneyReduce = body.dataList.reduce((acc, item) => {
      return acc + item.debtTotalMinus
    }, 0)
    if (body.totalMoney !== totalMoneyReduce) {
      throw new BusinessError('Tổng số tiền không khớp', {
        totalMoney: body.totalMoney,
        totalMoneyReduce,
      })
    }

    const ticketIdHasPaidItem = body.dataList.filter((i) => i.isPaymentEachItem).map((i) => i.ticketId)
    const dataMap: Record<string, PaymentTicketItemMapDtoType> = {}
    if (ticketIdHasPaidItem.length) {
      const [
        ticketPaymentDetailList,
        ticketProcedureDebtList,
        ticketProductDebtList,
        ticketLaboratoryDebtList,
        ticketRadiologyDebtList,
      ] = await Promise.all([
        this.ticketPaymentDetailRepository.findManyBy({
          oid,
          ticketId: { IN: ticketIdHasPaidItem },
        }),
        this.ticketProcedureRepository.findManyBy({
          oid,
          ticketId: { IN: ticketIdHasPaidItem },
          debt: { GT: 0 },
        }),
        this.ticketProductRepository.findManyBy({
          oid,
          ticketId: { IN: ticketIdHasPaidItem },
          debt: { GT: 0 },
        }),
        this.ticketLaboratoryRepository.findManyBy({
          oid,
          ticketId: { IN: ticketIdHasPaidItem },
          debt: { GT: 0 },
        }),
        this.ticketRadiologyRepository.findManyBy({
          oid,
          ticketId: { IN: ticketIdHasPaidItem },
          debt: { GT: 0 },
        }),
      ])
      body.dataList.forEach((i) => {
        const { ticketId, debtTotalMinus } = i
        if (!debtTotalMinus) return
        dataMap[ticketId] = {
          paymentWait: { paidMoney: 0 },
          paymentDiscount: { debtMoney: 0, paidMoney: 0 },
          paymentSurcharge: { debtMoney: 0, paidMoney: 0 },
          ticketRegimenBodyList: [],
          ticketProcedureNoEffectBodyList: [],
          ticketProcedureHasEffectBodyList: [],
          ticketProductConsumableBodyList: [],
          ticketProductPrescriptionBodyList: [],
          ticketLaboratoryBodyList: [],
          ticketRadiologyBodyList: [],
        }
        let debtRemain = debtTotalMinus
        const ticketPaymentDetail = ticketPaymentDetailList.find((i) => i.ticketId === ticketId)
        if (ticketPaymentDetail.debtSurcharge) {
          const debtSelect = Math.min(debtRemain, ticketPaymentDetail.debtSurcharge)
          const paymentTicketSurcharge: PaymentTicketSurchargeDto = {
            paidMoney: debtSelect,
            debtMoney: -debtSelect,
          }
          debtRemain = debtRemain - debtSelect
          dataMap[ticketId].paymentSurcharge = paymentTicketSurcharge
        }
        if (ticketPaymentDetail.debtDiscount) {
          const debtSelect = Math.min(debtRemain, ticketPaymentDetail.debtDiscount)
          const paymentTicketDiscount: PaymentTicketDiscountDto = {
            paidMoney: debtSelect,
            debtMoney: -debtSelect,
          }
          debtRemain = debtRemain - debtSelect
          dataMap[ticketId].paymentDiscount = paymentTicketDiscount
        }

        ticketProductDebtList
          .filter((i) => i.ticketId === ticketId)
          .forEach((i) => {
            const debtSelect = Math.min(debtRemain, i.debt)
            if (!debtSelect) return
            if (i.type === TicketProductType.Prescription) {
              const ticketItemDto: PaymentTicketItemDto = {
                ticketItemType: TicketItemType.TicketProductPrescription,
                ticketItemId: i.id,
                interactId: i.productId,
                expectedPrice: i.expectedPrice,
                discountMoney: i.discountMoney,
                discountPercent: i.discountPercent,
                discountType: i.discountType,
                actualPrice: i.actualPrice,
                quantity: i.quantity,
                sessionIndex: 0,
                paidMoney: debtSelect,
                debtMoney: -debtSelect,
              }
              debtRemain = debtRemain - debtSelect
              dataMap[ticketId].ticketProductPrescriptionBodyList.push(ticketItemDto)
            }
            if (i.type === TicketProductType.Consumable) {
              const ticketItemDto: PaymentTicketItemDto = {
                ticketItemType: TicketItemType.TicketProductConsumable,
                ticketItemId: i.id,
                interactId: i.productId,
                expectedPrice: i.expectedPrice,
                discountMoney: i.discountMoney,
                discountPercent: i.discountPercent,
                discountType: i.discountType,
                actualPrice: i.actualPrice,
                quantity: i.quantity,
                sessionIndex: 0,
                paidMoney: debtSelect,
                debtMoney: -debtSelect,
              }
              debtRemain = debtRemain - debtSelect
              dataMap[ticketId].ticketProductConsumableBodyList.push(ticketItemDto)
            }
          })
        ticketProcedureDebtList
          .filter((i) => i.ticketId === ticketId)
          .forEach((i) => {
            const debtSelect = Math.min(debtRemain, i.debt)
            if (!debtSelect) return
            const ticketItemDto: PaymentTicketItemDto = {
              ticketItemType: TicketItemType.TicketProcedure,
              ticketItemId: i.id,
              interactId: i.procedureId,
              expectedPrice: i.expectedPrice,
              discountMoney: i.discountMoney,
              discountPercent: i.discountPercent,
              discountType: i.discountType,
              actualPrice: i.actualPrice,
              quantity: i.quantity,
              sessionIndex: i.indexSession,
              paidMoney: debtSelect,
              debtMoney: -debtSelect,
            }
            debtRemain = debtRemain - debtSelect
            dataMap[ticketId].ticketProcedureHasEffectBodyList.push(ticketItemDto)
          })
        ticketLaboratoryDebtList
          .filter((i) => i.ticketId === ticketId)
          .forEach((i) => {
            const debtSelect = Math.min(debtRemain, i.debt)
            if (!debtSelect) return
            const ticketItemDto: PaymentTicketItemDto = {
              ticketItemType: TicketItemType.TicketLaboratory,
              ticketItemId: i.id,
              interactId: i.laboratoryId,
              expectedPrice: i.expectedPrice,
              discountMoney: i.discountMoney,
              discountPercent: i.discountPercent,
              discountType: i.discountType,
              actualPrice: i.actualPrice,
              quantity: 1,
              sessionIndex: 0,
              paidMoney: debtSelect,
              debtMoney: -debtSelect,
            }
            debtRemain = debtRemain - debtSelect
            dataMap[ticketId].ticketLaboratoryBodyList.push(ticketItemDto)
          })
        ticketRadiologyDebtList
          .filter((i) => i.ticketId === ticketId)
          .forEach((i) => {
            const debtSelect = Math.min(debtRemain, i.debt)
            if (!debtSelect) return
            const ticketItemDto: PaymentTicketItemDto = {
              ticketItemType: TicketItemType.TicketRadiology,
              ticketItemId: i.id,
              interactId: i.radiologyId,
              expectedPrice: i.expectedPrice,
              discountMoney: i.discountMoney,
              discountPercent: i.discountPercent,
              discountType: i.discountType,
              actualPrice: i.actualPrice,
              quantity: 1,
              sessionIndex: 0,
              paidMoney: debtSelect,
              debtMoney: -debtSelect,
            }
            debtRemain = debtRemain - debtSelect
            dataMap[ticketId].ticketRadiologyBodyList.push(ticketItemDto)
          })

        if (debtRemain) {
          throw new BusinessError(`Lỗi phiếu ${ticketId}, số nợ trong phiếu không phù hợp`)
        }
      })
    }

    const paymentPropList = body.dataList.map((i) => {
      const paymentProp: TicketPaymentOperationPropType = {
        oid,
        ticketId: i.ticketId,
        userId,
        walletId: body.walletId,
        time: Date.now(),
        note: body.note,
        paymentActionType: PaymentActionType.PayDebt,
        paidTotal: i.debtTotalMinus,
        debtTotal: -i.debtTotalMinus,
        hasPaymentItem: i.isPaymentEachItem,
        paymentTicketItemMapDto: dataMap[i.ticketId],
      }
      return paymentProp
    })

    const paymentListResult =
      await this.ticketPaymentOperation.startPaymentMoneyList(paymentPropList)

    paymentListResult.forEach((paymentResult) => {
      this.socketEmitService.socketTicketChange(oid, {
        ticketId: paymentResult.ticketModified.id,
        ticketModified: paymentResult.ticketModified,
        ticketPaymentDetailModified: paymentResult.ticketPaymentDetailModified,
        ticketRegimen: { upsertedList: paymentResult.ticketRegimentList || [] },
        ticketRegimenItem: { upsertedList: paymentResult.ticketRegimenItemModifiedList || [] },
        ticketProcedure: { upsertedList: paymentResult.ticketProcedureModifiedList },
        ticketProduct: { upsertedList: paymentResult.ticketProductModifiedList },
        ticketLaboratory: { upsertedList: paymentResult.ticketLaboratoryModifiedList },
        ticketLaboratoryGroup: { upsertedList: paymentResult.ticketLaboratoryGroupModifiedList },
        ticketRadiology: { upsertedList: paymentResult.ticketRadiologyModifiedList },
      })
    })

    const customerModified = paymentListResult[paymentListResult.length - 1].customerModified
    const ticketModifiedList = paymentListResult.map((i) => i.ticketModified)
    this.socketEmitService.customerUpsert(oid, { customer: customerModified })

    return { customerModified, ticketModifiedList }
  }
}
