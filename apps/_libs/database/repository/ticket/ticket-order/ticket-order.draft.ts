import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager, FindOptionsWhere, In, InsertResult } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus, VoucherType } from '../../../common/variable'
import {
  Ticket,
  TicketExpense,
  TicketProcedure,
  TicketProduct,
  TicketSurcharge,
} from '../../../entities'
import { TicketExpenseInsertType } from '../../../entities/ticket-expense.entity'
import {
  TicketProcedureInsertType,
  TicketProcedureStatus,
} from '../../../entities/ticket-procedure.entity'
import { TicketProductInsertType, TicketProductType } from '../../../entities/ticket-product.entity'
import { TicketRadiologyStatus } from '../../../entities/ticket-radiology.entity'
import { TicketSurchargeInsertType } from '../../../entities/ticket-surcharge.entity'
import { TicketInsertType, TicketStatus } from '../../../entities/ticket.entity'
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
  }) {
    const {
      oid,
      ticketOrderProductDraftList,
      ticketOrderProcedureDraftList,
      ticketOrderSurchargeDraftList,
      ticketOrderExpenseDraftList,
    } = params
    const ticketOrderDraftInsert: TicketOrderDraftInsertType = params.ticketOrderDraftInsert

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const ticketInsert: NoExtra<TicketInsertType> = {
        ...ticketOrderDraftInsert,
        oid,
        ticketStatus: TicketStatus.Draft,
        deliveryStatus: ticketOrderProductDraftList.length
          ? DeliveryStatus.Pending
          : DeliveryStatus.NoStock,
        procedureStatus: ticketOrderProcedureDraftList.length
          ? TicketProcedureStatus.Completed
          : TicketProcedureStatus.Empty,
        radiologyStatus: TicketRadiologyStatus.Empty,
        voucherType: VoucherType.Order,
        paid: 0,
        debt: ticketOrderDraftInsert.totalMoney,
        year: 0,
        month: 0,
        date: 0,
        startedAt: ticketOrderDraftInsert.registeredAt,
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

      return { ticketBasic }
    })
  }

  async destroy(params: { oid: number; ticketId: number }) {
    const { oid, ticketId } = params
    const whereTicket: FindOptionsWhere<Ticket> = {
      id: ticketId,
      oid,
      voucherType: VoucherType.Order,
      ticketStatus: In([TicketStatus.Schedule, TicketStatus.Draft]),
      deliveryStatus: In([DeliveryStatus.NoStock, DeliveryStatus.Pending]),
    }
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const ticketDeleteResult = await manager.delete(Ticket, whereTicket)
      if (ticketDeleteResult.affected !== 1) {
        throw new Error(`Destroy Ticket ${ticketId} failed: Status invalid`)
      }
      await manager.delete(TicketProduct, { oid, ticketId })
      await manager.delete(TicketProcedure, { oid, ticketId })
      // await manager.delete(TicketRadiology, { oid, ticketId })
      await manager.delete(TicketSurcharge, { oid, ticketId })
      await manager.delete(TicketExpense, { oid, ticketId })
    })
  }
}
