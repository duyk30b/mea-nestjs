import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESTimer } from '../../../common/helpers/time.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { GenerateId } from '../../common/generate-id'
import { DeliveryStatus, PaymentMoneyStatus } from '../../common/variable'
import { TicketAttributeInsertType } from '../../entities/ticket-attribute.entity'
import TicketExpense, {
  TicketExpenseInsertType,
  TicketExpenseRelationType,
} from '../../entities/ticket-expense.entity'
import TicketProcedure, {
  TicketProcedureInsertType,
  TicketProcedureStatus,
  TicketProcedureType,
} from '../../entities/ticket-procedure.entity'
import TicketProduct, {
  TicketProductInsertType,
  TicketProductRelationType,
  TicketProductType,
} from '../../entities/ticket-product.entity'
import TicketSurcharge, {
  TicketSurchargeInsertType,
  TicketSurchargeRelationType,
} from '../../entities/ticket-surcharge.entity'
import Ticket, { TicketInsertType, TicketStatus } from '../../entities/ticket.entity'
import {
  TicketAttributeManager,
  TicketExpenseManager,
  TicketManager,
  TicketProcedureManager,
  TicketProductManager,
  TicketSurchargeManager,
} from '../../repositories'

export type TicketOrderDraftUpsertType = Pick<
  Ticket,
  | 'customerId'
  | 'customerSourceId'
  | 'roomId'
  | 'productMoney'
  | 'procedureMoney'
  | 'radiologyMoney'
  | 'laboratoryMoney'
  | 'itemsCostAmount'
  | 'itemsDiscount'
  | 'itemsActualMoney'
  | 'discountMoney'
  | 'discountPercent'
  | 'discountType'
  | 'surcharge'
  | 'totalMoney'
  | 'expense'
  | 'commissionMoney'
  | 'profit'
  | 'createdAt'
  | 'note'
>

export type TicketOrderProductDraftType = Omit<
  TicketProduct,
  | keyof TicketProductRelationType
  | keyof Pick<
    TicketProduct,
    | 'oid'
    | 'id'
    | 'ticketId'
    | 'deliveryStatus'
    | 'customerId'
    | 'quantityPrescription'
    | 'type'
    | 'ticketProcedureId'
    | 'paymentMoneyStatus'
  >
>

export type TicketOrderProcedureDraftType = Pick<
  TicketProcedure,
  | 'priority'
  | 'procedureId'
  | 'quantity'
  | 'expectedPrice'
  | 'discountMoney'
  | 'discountPercent'
  | 'discountType'
  | 'actualPrice'
>

export type TicketOrderSurchargeDraftType = Omit<
  TicketSurcharge,
  keyof TicketSurchargeRelationType | keyof Pick<TicketSurcharge, 'oid' | 'id' | 'ticketId'>
>

export type TicketOrderExpenseDraftType = Omit<
  TicketExpense,
  keyof TicketExpenseRelationType | keyof Pick<TicketExpense, 'oid' | 'id' | 'ticketId'>
>

@Injectable()
export class TicketOrderDraftOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketAttributeManager: TicketAttributeManager,
    private ticketProductManager: TicketProductManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketSurchargeManager: TicketSurchargeManager,
    private ticketExpenseManager: TicketExpenseManager
  ) { }

  async upsert<
    T extends TicketOrderDraftUpsertType,
    U extends TicketOrderProductDraftType,
    X extends TicketOrderProcedureDraftType,
  >(params: {
    oid: number
    ticketId: string
    ticketOrderDraftUpsertDto: NoExtra<TicketOrderDraftUpsertType, T>
    ticketOrderProductDraftListDto: NoExtra<TicketOrderProductDraftType, U>[]
    ticketOrderProcedureDraftListDto: NoExtra<TicketOrderProcedureDraftType, X>[]
    ticketOrderSurchargeDraftListDto: TicketOrderSurchargeDraftType[]
    ticketOrderExpenseDraftListDto: TicketOrderExpenseDraftType[]
    ticketAttributeDraftListDto?: { key: string; value: any }[]
  }) {
    const {
      oid,
      ticketId,
      ticketOrderProductDraftListDto,
      ticketOrderSurchargeDraftListDto,
      ticketOrderExpenseDraftListDto,
      ticketAttributeDraftListDto,
    } = params
    const ticketOrderProcedureDraftListDto: TicketOrderProcedureDraftType[] =
      params.ticketOrderProcedureDraftListDto
    const ticketOrderDraftUpsertDto: TicketOrderDraftUpsertType = params.ticketOrderDraftUpsertDto
    const createdAt = ticketOrderDraftUpsertDto.createdAt

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      let ticket: Ticket
      const ticketUpsert: Omit<TicketInsertType, 'oid'> = {
        ...ticketOrderDraftUpsertDto,
        status: TicketStatus.Draft,
        deliveryStatus: ticketOrderProductDraftListDto.length
          ? DeliveryStatus.Pending
          : DeliveryStatus.NoStock,
        paid: 0,
        debt: ticketOrderDraftUpsertDto.totalMoney,
        createdAt,
        receptionAt: createdAt,
        year: ESTimer.info(createdAt, 7).year,
        month: ESTimer.info(createdAt, 7).month + 1,
        date: ESTimer.info(createdAt, 7).date,
        dailyIndex: 0,
        endedAt: null,
        imageDiagnosisIds: '[]',
        isPaymentEachItem: 0,
      }
      if (!ticketId) {
        ticket = await this.ticketManager.insertOneAndReturnEntity(manager, {
          ...ticketUpsert,
          oid,
        })
      } else {
        ticket = await this.ticketManager.updateOneAndReturnEntity(
          manager,
          { id: ticketId, oid },
          ticketUpsert
        )

        await this.ticketAttributeManager.delete(manager, { oid, ticketId })
        await this.ticketProductManager.delete(manager, { oid, ticketId })
        await this.ticketProcedureManager.delete(manager, { oid, ticketId })
        await this.ticketSurchargeManager.delete(manager, { oid, ticketId })
        await this.ticketExpenseManager.delete(manager, { oid, ticketId })
      }

      if (ticketOrderProductDraftListDto.length) {
        const ticketProductListInsert = ticketOrderProductDraftListDto.map((i) => {
          const ticketProduct: NoExtra<TicketProductInsertType> = {
            ...i,
            id: GenerateId.nextId(),
            oid,
            ticketId: ticket.id,
            customerId: ticketOrderDraftUpsertDto.customerId,
            deliveryStatus: DeliveryStatus.Pending,
            quantityPrescription: i.quantity,
            type: TicketProductType.Prescription,
            paymentMoneyStatus: PaymentMoneyStatus.TicketPaid,
            costAmount: i.costAmount, // tính lãi tạm thời, chỉ có thể tính chính xác khi gửi hàng, lúc đó tính cost theo từng lô hàng
            ticketProcedureId: '0',
          }
          return ticketProduct
        })
        ticket.ticketProductList = await this.ticketProductManager.insertManyAndReturnEntity(
          manager,
          ticketProductListInsert
        )
      }

      if (ticketOrderProcedureDraftListDto) {
        const ticketProcedureListInsert = ticketOrderProcedureDraftListDto.map((i) => {
          const ticketProcedure: TicketProcedureInsertType = {
            ...i,
            id: GenerateId.nextId(),
            oid,
            ticketId: ticket.id,
            customerId: ticketOrderDraftUpsertDto.customerId,
            createdAt: ticketOrderDraftUpsertDto.createdAt,
            status: TicketProcedureStatus.NoAction,
            imageIds: JSON.stringify([]),
            result: '',
            completedAt: null,
            costAmount: 0,
            ticketRegimenId: '0',
            ticketRegimenItemId: '0',
            indexSession: 0,
            commissionAmount: 0,
            ticketProcedureType: TicketProcedureType.Normal,
            paymentMoneyStatus: PaymentMoneyStatus.TicketPaid,
          }
          return ticketProcedure
        })
        ticket.ticketProcedureList = await this.ticketProcedureManager.insertManyAndReturnEntity(
          manager,
          ticketProcedureListInsert
        )
      }

      if (ticketOrderSurchargeDraftListDto.length) {
        const ticketSurchargeListInsert = ticketOrderSurchargeDraftListDto.map((i) => {
          const ticketSurcharge: TicketSurchargeInsertType = {
            ...i,
            oid,
            ticketId: ticket.id,
          }
          return ticketSurcharge
        })
        await this.ticketSurchargeManager.insertMany(manager, ticketSurchargeListInsert)
      }

      if (ticketOrderExpenseDraftListDto.length) {
        const ticketExpenseListInsert = ticketOrderExpenseDraftListDto.map((i) => {
          const ticketExpense: TicketExpenseInsertType = {
            ...i,
            oid,
            ticketId: ticket.id,
          }
          return ticketExpense
        })
        await this.ticketExpenseManager.insertMany(manager, ticketExpenseListInsert)
      }

      if (ticketAttributeDraftListDto?.length) {
        const ticketAttributeListInsert = ticketAttributeDraftListDto.map((i) => {
          const ticketAttribute: TicketAttributeInsertType = {
            ...i,
            oid,
            ticketId: ticket.id,
          }
          return ticketAttribute
        })
        await this.ticketAttributeManager.insertMany(manager, ticketAttributeListInsert)
      }

      return { ticket }
    })
  }
}
