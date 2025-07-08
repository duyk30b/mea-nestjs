import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESTimer } from '../../../common/helpers/time.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { DeliveryStatus } from '../../common/variable'
import { TicketAttributeInsertType } from '../../entities/ticket-attribute.entity'
import { TicketExpenseInsertType } from '../../entities/ticket-expense.entity'
import {
  TicketProcedureInsertType,
  TicketProcedureStatus,
} from '../../entities/ticket-procedure.entity'
import { TicketProductInsertType, TicketProductType } from '../../entities/ticket-product.entity'
import { TicketSurchargeInsertType } from '../../entities/ticket-surcharge.entity'
import Ticket, {
  TicketInsertType,
  TicketRelationType,
  TicketStatus,
  TicketType,
} from '../../entities/ticket.entity'
import {
  TicketExpenseManager,
  TicketLaboratoryManager,
  TicketManager,
  TicketProcedureManager,
  TicketProductManager,
  TicketRadiologyManager,
  TicketSurchargeManager,
} from '../../managers'
import { TicketAttributeManager } from '../../managers/ticket-attribute.manager'
import {
  TicketOrderExpenseDraftType,
  TicketOrderProcedureDraftType,
  TicketOrderProductDraftType,
  TicketOrderSurchargeDraftType,
} from './ticket-order.dto'

export type TicketOrderDraftUpsertType = Omit<
  Ticket,
  | keyof TicketRelationType
  | keyof Pick<
    Ticket,
    | 'oid'
    | 'id'
    | 'ticketType'
    | 'status'
    | 'deliveryStatus'
    | 'paid'
    | 'debt'
    | 'year'
    | 'month'
    | 'date'
    | 'startedAt'
    | 'updatedAt'
    | 'endedAt'
  >
>

@Injectable()
export class TicketOrderDraftOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketAttributeManager: TicketAttributeManager,
    private ticketProductManager: TicketProductManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketRadiologyManager: TicketRadiologyManager,
    private ticketSurchargeManager: TicketSurchargeManager,
    private ticketExpenseManager: TicketExpenseManager
  ) { }

  async upsert<
    T extends TicketOrderDraftUpsertType,
    U extends TicketOrderProductDraftType,
    X extends TicketOrderProcedureDraftType,
  >(params: {
    oid: number
    ticketId: number
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
      ticketOrderProcedureDraftListDto,
      ticketOrderSurchargeDraftListDto,
      ticketOrderExpenseDraftListDto,
      ticketAttributeDraftListDto,
    } = params
    const ticketOrderDraftUpsertDto: TicketOrderDraftUpsertType = params.ticketOrderDraftUpsertDto
    const registeredAt = ticketOrderDraftUpsertDto.registeredAt

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      let ticket: Ticket
      const ticketUpsert: Omit<TicketInsertType, 'oid'> = {
        ...ticketOrderDraftUpsertDto,
        status: TicketStatus.Draft,
        deliveryStatus: ticketOrderProductDraftListDto.length
          ? DeliveryStatus.Pending
          : DeliveryStatus.NoStock,
        ticketType: TicketType.Order,
        paid: 0,
        debt: ticketOrderDraftUpsertDto.totalMoney,
        registeredAt,
        startedAt: registeredAt,
        year: ESTimer.info(registeredAt, 7).year,
        month: ESTimer.info(registeredAt, 7).month + 1,
        date: ESTimer.info(registeredAt, 7).date,
        endedAt: null,
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
            oid,
            ticketId: ticket.id,
            customerId: ticketOrderDraftUpsertDto.customerId,
            deliveryStatus: DeliveryStatus.Pending,
            quantityPrescription: i.quantity,
            type: TicketProductType.Prescription,
            costAmount: i.costAmount, // tính lãi tạm thời, chỉ có thể tính chính xác khi gửi hàng, lúc đó tính cost theo từng lô hàng
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
            oid,
            ticketId: ticket.id,
            customerId: ticketOrderDraftUpsertDto.customerId,
            startedAt: ticketOrderDraftUpsertDto.registeredAt,
            status: TicketProcedureStatus.Completed,
            imageIds: JSON.stringify([]),
            result: '',
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
