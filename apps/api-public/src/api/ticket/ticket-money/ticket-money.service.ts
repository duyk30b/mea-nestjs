import { Injectable } from '@nestjs/common'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { TicketItemType } from '../../../../../_libs/database/entities/payment-ticket-item.entity'
import { PaymentActionType } from '../../../../../_libs/database/entities/payment.entity'
import { TicketProductType } from '../../../../../_libs/database/entities/ticket-product.entity'
import {
  TicketPaymentItemDto,
  TicketPaymentItemMapDtoType,
  TicketPaymentOperation,
  TicketPaymentOperationPropType,
} from '../../../../../_libs/database/operations'
import {
  TicketLaboratoryRepository,
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
      paidAdd: body.paidAdd,
      paidItemAdd: body.paidItemAdd,
      debtAdd: body.debtAdd,
      debtItemAdd: body.debtItemAdd,
      ticketPaymentItemMapDto: body.ticketPaymentItemMapBody,
    })
    const { ticketModified, customerModified, paymentCreated } = paymentResult

    this.socketEmitService.socketTicketChange(oid, {
      ticketId: paymentResult.ticketModified.id,
      ticketModified: paymentResult.ticketModified,
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
      return acc + item.debtMinus + item.debtItemMinus
    }, 0)
    if (body.totalMoney !== totalMoneyReduce) {
      throw new BusinessError('Tổng số tiền không khớp', {
        totalMoney: body.totalMoney,
        totalMoneyReduce,
      })
    }

    const ticketIdHasPaidItem = body.dataList.filter((i) => i.debtItemMinus).map((i) => i.ticketId)
    const dataMap: Record<string, TicketPaymentItemMapDtoType> = {}
    if (ticketIdHasPaidItem) {
      const [
        ticketProcedureDebtList,
        ticketProductDebtList,
        ticketLaboratoryDebtList,
        ticketRadiologyDebtList,
      ] = await Promise.all([
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
        const { ticketId, debtItemMinus } = i
        if (!debtItemMinus) return
        dataMap[ticketId] = {
          ticketRegimenBodyList: [],
          ticketProcedureNoEffectBodyList: [],
          ticketProcedureHasEffectBodyList: [],
          ticketProductConsumableBodyList: [],
          ticketProductPrescriptionBodyList: [],
          ticketLaboratoryBodyList: [],
          ticketRadiologyBodyList: [],
        }
        let debtRemain = debtItemMinus
        ticketProductDebtList
          .filter((i) => i.ticketId === ticketId)
          .forEach((i) => {
            const debtSelect = Math.min(debtRemain, i.debt)
            if (!debtSelect) return
            if (i.type === TicketProductType.Prescription) {
              const ticketItemDto: TicketPaymentItemDto = {
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
                paidAdd: debtSelect,
                debtAdd: -debtSelect,
              }
              debtRemain = debtRemain - debtSelect
              dataMap[ticketId].ticketProductPrescriptionBodyList.push(ticketItemDto)
            }
            if (i.type === TicketProductType.Consumable) {
              const ticketItemDto: TicketPaymentItemDto = {
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
                paidAdd: debtSelect,
                debtAdd: -debtSelect,
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
            const ticketItemDto: TicketPaymentItemDto = {
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
              paidAdd: debtSelect,
              debtAdd: -debtSelect,
            }
            debtRemain = debtRemain - debtSelect
            dataMap[ticketId].ticketProcedureHasEffectBodyList.push(ticketItemDto)
          })
        ticketLaboratoryDebtList
          .filter((i) => i.ticketId === ticketId)
          .forEach((i) => {
            const debtSelect = Math.min(debtRemain, i.debt)
            if (!debtSelect) return
            const ticketItemDto: TicketPaymentItemDto = {
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
              paidAdd: debtSelect,
              debtAdd: -debtSelect,
            }
            debtRemain = debtRemain - debtSelect
            dataMap[ticketId].ticketLaboratoryBodyList.push(ticketItemDto)
          })
        ticketRadiologyDebtList
          .filter((i) => i.ticketId === ticketId)
          .forEach((i) => {
            const debtSelect = Math.min(debtRemain, i.debt)
            if (!debtSelect) return
            const ticketItemDto: TicketPaymentItemDto = {
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
              paidAdd: debtSelect,
              debtAdd: -debtSelect,
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
        paidAdd: i.debtMinus,
        paidItemAdd: i.debtItemMinus,
        debtAdd: -i.debtMinus,
        debtItemAdd: -i.debtItemMinus,
        ticketPaymentItemMapDto: dataMap[i.ticketId],
      }
      return paymentProp
    })

    const paymentListResult =
      await this.ticketPaymentOperation.startPaymentMoneyList(paymentPropList)

    paymentListResult.forEach((paymentResult) => {
      this.socketEmitService.socketTicketChange(oid, {
        ticketId: paymentResult.ticketModified.id,
        ticketModified: paymentResult.ticketModified,
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
