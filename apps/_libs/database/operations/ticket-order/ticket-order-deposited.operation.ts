import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { ESTimer } from '../../../common/helpers/time.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { DeliveryStatus } from '../../common/variable'
import { Ticket } from '../../entities'
import { TicketAttributeInsertType } from '../../entities/ticket-attribute.entity'
import { TicketExpenseInsertType } from '../../entities/ticket-expense.entity'
import {
  TicketProcedureInsertType,
  TicketProcedureStatus,
} from '../../entities/ticket-procedure.entity'
import { TicketProductInsertType, TicketProductType } from '../../entities/ticket-product.entity'
import { TicketSurchargeInsertType } from '../../entities/ticket-surcharge.entity'
import { TicketRelationType } from '../../entities/ticket.entity'
import {
  TicketExpenseManager,
  TicketLaboratoryManager,
  TicketManager,
  TicketProcedureManager,
  TicketProductManager,
  TicketRadiologyManager,
  TicketSurchargeManager,
  TicketUserManager,
} from '../../managers'
import { TicketAttributeManager } from '../../managers/ticket-attribute.manager'
import {
  TicketOrderExpenseDraftType,
  TicketOrderProcedureDraftType,
  TicketOrderProductDraftType,
  TicketOrderSurchargeDraftType,
} from './ticket-order.dto'

export type TicketOrderDepositedUpdateType = Omit<
  Ticket,
  | keyof TicketRelationType
  | keyof Pick<
    Ticket,
    | 'oid'
    | 'id'
    | 'customerId' // không được update customerId
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
export class TicketOrderDepositedOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager,
    private ticketAttributeManager: TicketAttributeManager,
    private ticketProductManager: TicketProductManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketRadiologyManager: TicketRadiologyManager,
    private ticketSurchargeManager: TicketSurchargeManager,
    private ticketExpenseManager: TicketExpenseManager,
    private ticketUserManager: TicketUserManager
  ) { }

  async update<T extends TicketOrderDepositedUpdateType>(params: {
    oid: number
    ticketId: number
    ticketOrderDepositedUpdateDto: NoExtra<TicketOrderDepositedUpdateType, T>
    ticketOrderProductDraftListDto: TicketOrderProductDraftType[]
    ticketOrderProcedureDraftListDto: TicketOrderProcedureDraftType[]
    ticketOrderSurchargeDraftListDto: TicketOrderSurchargeDraftType[]
    ticketOrderExpenseDraftListDto: TicketOrderExpenseDraftType[]
    ticketAttributeDraftListDto?: { key: string; value: any }[]
  }) {
    const {
      oid,
      ticketId,
      ticketOrderDepositedUpdateDto,
      ticketOrderProductDraftListDto,
      ticketOrderProcedureDraftListDto,
      ticketOrderSurchargeDraftListDto,
      ticketOrderExpenseDraftListDto,
      ticketAttributeDraftListDto,
    } = params
    const registeredAt = ticketOrderDepositedUpdateDto.registeredAt

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { id: ticketId, oid },
        {
          ...ticketOrderDepositedUpdateDto,
          // status: TicketStatus.Draft, // giữ nguyên status
          // deliveryStatus: DeliveryStatus.Pending, // Deposited thì chưa gửi hàng, vẫn giữ nguyên vậy
          // paid: 0, // giữ nguyên số tiền đã trả
          debt: () => `${ticketOrderDepositedUpdateDto.totalMoney} - paid`,
          registeredAt,
          startedAt: registeredAt,
          year: ESTimer.info(registeredAt, 7).year,
          month: ESTimer.info(registeredAt, 7).month + 1,
          date: ESTimer.info(registeredAt, 7).date,
        }
      )

      await this.ticketAttributeManager.delete(manager, { oid, ticketId })
      await this.ticketProductManager.delete(manager, { oid, ticketId })
      await this.ticketProcedureManager.delete(manager, { oid, ticketId })
      await this.ticketSurchargeManager.delete(manager, { oid, ticketId })
      await this.ticketExpenseManager.delete(manager, { oid, ticketId })

      if (ticketOrderProductDraftListDto.length) {
        const ticketProductListInsert = ticketOrderProductDraftListDto.map((i) => {
          const ticketProduct: NoExtra<TicketProductInsertType> = {
            ...i,
            oid,
            ticketId,
            customerId: ticket.customerId,
            quantityPrescription: i.quantity, // cho lấy số lượng kê đơn bằng số lượng bán
            deliveryStatus: DeliveryStatus.Pending,
            type: TicketProductType.Prescription,
          }
          return ticketProduct
        })
        await this.ticketProductManager.insertMany(manager, ticketProductListInsert)
      }

      if (ticketOrderProcedureDraftListDto.length) {
        const ticketProcedureListInsert = ticketOrderProcedureDraftListDto.map((i) => {
          const ticketProcedure: TicketProcedureInsertType = {
            ...i,
            oid,
            ticketId,
            customerId: ticket.customerId,
            startedAt: ticket.registeredAt,
            status: TicketProcedureStatus.Completed,
            imageIds: JSON.stringify([]),
            result: '',
          }
          return ticketProcedure
        })
        await this.ticketProcedureManager.insertMany(manager, ticketProcedureListInsert)
      }

      if (ticketOrderSurchargeDraftListDto.length) {
        const ticketSurchargeListInsert = ticketOrderSurchargeDraftListDto.map((i) => {
          const ticketSurcharge: TicketSurchargeInsertType = {
            ...i,
            oid,
            ticketId,
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
            ticketId,
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
