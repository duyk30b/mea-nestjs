import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager, FindOptionsWhere, In } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DeliveryStatus } from '../../../common/variable'
import {
  Ticket,
  TicketExpense,
  TicketProcedure,
  TicketProduct,
  TicketSurcharge,
} from '../../../entities'
import { TicketExpenseInsertType } from '../../../entities/ticket-expense.entity'
import { TicketProcedureInsertType, TicketProcedureStatus } from '../../../entities/ticket-procedure.entity'
import { TicketProductInsertType, TicketProductType } from '../../../entities/ticket-product.entity'
import { TicketRadiologyStatus } from '../../../entities/ticket-radiology.entity'
import { TicketSurchargeInsertType } from '../../../entities/ticket-surcharge.entity'
import { TicketStatus, TicketType } from '../../../entities/ticket.entity'
import {
  TicketOrderDraftApprovedUpdateType,
  TicketOrderExpenseDraftType,
  TicketOrderProcedureDraftType,
  TicketOrderProductDraftType,
  TicketOrderSurchargeDraftType,
} from './ticket-order.dto'

@Injectable()
export class TicketOrderDraftApprovedUpdate {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager
  ) { }

  async update<T extends TicketOrderDraftApprovedUpdateType>(params: {
    oid: number
    ticketId: number
    ticketOrderDraftApprovedUpdate: NoExtra<TicketOrderDraftApprovedUpdateType, T>
    ticketOrderProductDraftList: TicketOrderProductDraftType[]
    ticketOrderProcedureDraftList: TicketOrderProcedureDraftType[]
    ticketOrderSurchargeDraftList: TicketOrderSurchargeDraftType[]
    ticketOrderExpenseDraftList: TicketOrderExpenseDraftType[]
  }) {
    const {
      oid,
      ticketId,
      ticketOrderDraftApprovedUpdate,
      ticketOrderProductDraftList,
      ticketOrderProcedureDraftList,
      ticketOrderSurchargeDraftList,
      ticketOrderExpenseDraftList,
    } = params
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const whereTicket: FindOptionsWhere<Ticket> = {
        id: ticketId,
        oid,
        ticketStatus: In([TicketStatus.Draft, TicketStatus.Approved]),
        // debt: 0,
      }
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        ...ticketOrderDraftApprovedUpdate,
        // ticketStatus: TicketStatus.Draft, // giữ nguyên status
        deliveryStatus: ticketOrderProductDraftList.length
          ? DeliveryStatus.Pending
          : DeliveryStatus.NoStock,
        procedureStatus: ticketOrderProcedureDraftList.length
          ? TicketProcedureStatus.Completed
          : TicketProcedureStatus.Empty,
        radiologyStatus: TicketRadiologyStatus.Empty,
        paid: 0,
        debt: ticketOrderDraftApprovedUpdate.totalMoney,
        startedAt: ticketOrderDraftApprovedUpdate.registeredAt,
      }
      const ticketUpdateResult = await manager
        .createQueryBuilder()
        .update(Ticket)
        .where(whereTicket)
        .set(setTicket)
        .returning('*')
        .execute()
      if (ticketUpdateResult.affected !== 1) {
        throw new Error(`Update Ticket ${ticketId} failed: Status invalid`)
      }
      const ticketBasic = Ticket.fromRaw(ticketUpdateResult.raw[0])

      await manager.delete(TicketProduct, { oid, ticketId })
      await manager.delete(TicketProcedure, { oid, ticketId })
      // await manager.delete(TicketRadiology, { oid, ticketId })
      await manager.delete(TicketSurcharge, { oid, ticketId })
      await manager.delete(TicketExpense, { oid, ticketId })

      if (ticketOrderProductDraftList.length) {
        const ticketProductListInsert = ticketOrderProductDraftList.map((i) => {
          const ticketProduct: NoExtra<TicketProductInsertType> = {
            ...i,
            oid,
            ticketId,
            customerId: ticketBasic.customerId,
            quantityPrescription: i.quantity, // cho lấy số lượng kê đơn bằng số lượng bán
            quantityReturn: 0,
            deliveryStatus: DeliveryStatus.Pending,
            type: TicketProductType.Prescription,
          }
          return ticketProduct
        })
        await manager.insert(TicketProduct, ticketProductListInsert)
      }

      if (ticketOrderProcedureDraftList.length) {
        const ticketProcedureListInsert = ticketOrderProcedureDraftList.map((i) => {
          const ticketProcedure: TicketProcedureInsertType = {
            ...i,
            oid,
            ticketId,
            customerId: ticketBasic.customerId,
            startedAt: ticketBasic.registeredAt,
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
            ticketId,
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
            ticketId,
          }
          return ticketExpense
        })
        await manager.insert(TicketExpense, ticketExpenseListInsert)
      }

      return { ticketBasic }
    })
  }
}
