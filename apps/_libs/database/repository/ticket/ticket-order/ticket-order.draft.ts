import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager, InsertResult } from 'typeorm'
import { DTimer } from '../../../../common/helpers/time.helper'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus } from '../../../common/variable'
import {
  Ticket,
  TicketExpense,
  TicketProcedure,
  TicketProduct,
  TicketSurcharge,
} from '../../../entities'
import TicketAttribute, {
  TicketAttributeInsertType,
} from '../../../entities/ticket-attribute.entity'
import { TicketExpenseInsertType } from '../../../entities/ticket-expense.entity'
import {
  TicketProcedureInsertType,
  TicketProcedureStatus,
} from '../../../entities/ticket-procedure.entity'
import { TicketProductInsertType, TicketProductType } from '../../../entities/ticket-product.entity'
import { TicketSurchargeInsertType } from '../../../entities/ticket-surcharge.entity'
import { TicketInsertType, TicketStatus, TicketType } from '../../../entities/ticket.entity'
import {
  TicketOrderDraftInsertType,
  TicketOrderExpenseDraftType,
  TicketOrderProcedureDraftType,
  TicketOrderProductDraftType,
  TicketOrderSurchargeDraftType,
} from './ticket-order.dto'

@Injectable()
export class TicketOrderDraft {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager
  ) { }

  async create<T extends TicketOrderDraftInsertType>(params: {
    oid: number
    ticketOrderDraftInsert: NoExtra<TicketOrderDraftInsertType, T>
    ticketOrderProductDraftList: TicketOrderProductDraftType[]
    ticketOrderProcedureDraftList: TicketOrderProcedureDraftType[]
    ticketOrderSurchargeDraftList: TicketOrderSurchargeDraftType[]
    ticketOrderExpenseDraftList: TicketOrderExpenseDraftType[]
    ticketAttributeDraftList: { key: string; value: any }[]
  }) {
    const {
      oid,
      ticketOrderProductDraftList,
      ticketOrderProcedureDraftList,
      ticketOrderSurchargeDraftList,
      ticketOrderExpenseDraftList,
      ticketAttributeDraftList,
    } = params
    const ticketOrderDraftInsert: TicketOrderDraftInsertType = params.ticketOrderDraftInsert
    const registeredAt = ticketOrderDraftInsert.registeredAt

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const ticketInsert: NoExtra<TicketInsertType> = {
        ...ticketOrderDraftInsert,
        oid,
        ticketStatus: TicketStatus.Draft,
        ticketType: TicketType.Order,
        paid: 0,
        debt: ticketOrderDraftInsert.totalMoney,
        registeredAt,
        startedAt: registeredAt,
        year: DTimer.info(registeredAt, 7).year,
        month: DTimer.info(registeredAt, 7).month + 1,
        date: DTimer.info(registeredAt, 7).date,
        endedAt: null,
      }

      const ticketInsertResult: InsertResult = await manager
        .createQueryBuilder()
        .insert()
        .into(Ticket)
        .values(ticketInsert)
        .returning('*')
        .execute()

      const [ticketBasic] = Ticket.fromRaws(ticketInsertResult.raw)

      if (!ticketBasic) {
        throw new Error(`Create TicketOrder failed: ${JSON.stringify(ticketInsertResult)}`)
      }

      // const ticketInsertResult = await manager.insert(Ticket, ticketInsert)
      // const ticketId: number = ticketInsertResult.identifiers?.[0]?.id
      // if (!ticketId) {
      //   throw new Error(`Create Ticket failed: Insert error ${JSON.stringify(ticketInsertResult)}`)
      // }

      if (ticketOrderProductDraftList.length) {
        const ticketProductListInsert = ticketOrderProductDraftList.map((i) => {
          const ticketProduct: NoExtra<TicketProductInsertType> = {
            ...i,
            oid,
            ticketId: ticketBasic.id,
            customerId: ticketOrderDraftInsert.customerId,
            deliveryStatus: DeliveryStatus.Pending,
            quantityPrescription: i.quantity,
            quantityReturn: 0,
            type: TicketProductType.Prescription,
          }
          return ticketProduct
        })
        await manager.insert(TicketProduct, ticketProductListInsert)
      }

      if (ticketOrderProcedureDraftList) {
        const ticketProcedureListInsert = ticketOrderProcedureDraftList.map((i) => {
          const ticketProcedure: TicketProcedureInsertType = {
            ...i,
            oid,
            ticketId: ticketBasic.id,
            customerId: ticketOrderDraftInsert.customerId,
            startedAt: ticketOrderDraftInsert.registeredAt,
            status: TicketProcedureStatus.Completed,
            imageIds: JSON.stringify([]),
            result: '',
          }
          return ticketProcedure
        })
        await manager.insert(TicketProcedure, ticketProcedureListInsert)
      }

      if (ticketOrderSurchargeDraftList.length) {
        const ticketSurchargeListInsert = ticketOrderSurchargeDraftList.map((i) => {
          const ticketSurcharge: TicketSurchargeInsertType = {
            ...i,
            oid,
            ticketId: ticketBasic.id,
          }
          return ticketSurcharge
        })
        await manager.insert(TicketSurcharge, ticketSurchargeListInsert)
      }

      if (ticketOrderExpenseDraftList.length) {
        const ticketExpenseListInsert = ticketOrderExpenseDraftList.map((i) => {
          const ticketExpense: TicketExpenseInsertType = {
            ...i,
            oid,
            ticketId: ticketBasic.id,
          }
          return ticketExpense
        })
        await manager.insert(TicketExpense, ticketExpenseListInsert)
      }

      if (ticketAttributeDraftList.length) {
        const ticketAttributeListInsert = ticketAttributeDraftList.map((i) => {
          const ticketAttribute: TicketAttributeInsertType = {
            ...i,
            oid,
            ticketId: ticketBasic.id,
          }
          return ticketAttribute
        })
        await manager.insert(TicketAttribute, ticketAttributeListInsert)
      }

      return { ticketBasic }
    })
  }
}
