import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DTimer } from '../../../common/helpers/time.helper'
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
import { TicketInsertType, TicketStatus, TicketType } from '../../entities/ticket.entity'
import { TicketExpenseManager, TicketLaboratoryManager, TicketManager, TicketProcedureManager, TicketProductManager, TicketRadiologyManager, TicketSurchargeManager, TicketUserManager } from '../../managers'
import { TicketAttributeManager } from '../../managers/ticket-attribute.manager'
import {
  TicketOrderDraftInsertType,
  TicketOrderExpenseDraftType,
  TicketOrderProcedureDraftType,
  TicketOrderProductDraftType,
  TicketOrderSurchargeDraftType,
} from './ticket-order.dto'

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
    private ticketExpenseManager: TicketExpenseManager,
    private ticketUserManager: TicketUserManager
  ) { }

  async create<T extends TicketOrderDraftInsertType>(params: {
    oid: number
    ticketOrderDraftInsertDto: NoExtra<TicketOrderDraftInsertType, T>
    ticketOrderProductDraftListDto: TicketOrderProductDraftType[]
    ticketOrderProcedureDraftListDto: TicketOrderProcedureDraftType[]
    ticketOrderSurchargeDraftListDto: TicketOrderSurchargeDraftType[]
    ticketOrderExpenseDraftListDto: TicketOrderExpenseDraftType[]
    ticketAttributeDraftListDto: { key: string; value: any }[]
  }) {
    const {
      oid,
      ticketOrderProductDraftListDto,
      ticketOrderProcedureDraftListDto,
      ticketOrderSurchargeDraftListDto,
      ticketOrderExpenseDraftListDto,
      ticketAttributeDraftListDto,
    } = params
    const ticketOrderDraftInsertDto: TicketOrderDraftInsertType = params.ticketOrderDraftInsertDto
    const registeredAt = ticketOrderDraftInsertDto.registeredAt

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const ticketInsert: NoExtra<TicketInsertType> = {
        ...ticketOrderDraftInsertDto,
        oid,
        ticketStatus: TicketStatus.Draft,
        ticketType: TicketType.Order,
        paid: 0,
        debt: ticketOrderDraftInsertDto.totalMoney,
        registeredAt,
        startedAt: registeredAt,
        year: DTimer.info(registeredAt, 7).year,
        month: DTimer.info(registeredAt, 7).month + 1,
        date: DTimer.info(registeredAt, 7).date,
        endedAt: null,
      }

      const ticket = await this.ticketManager.insertOneAndReturnEntity(manager, ticketInsert)

      if (ticketOrderProductDraftListDto.length) {
        const ticketProductListInsert = ticketOrderProductDraftListDto.map((i) => {
          const ticketProduct: NoExtra<TicketProductInsertType> = {
            ...i,
            oid,
            ticketId: ticket.id,
            customerId: ticketOrderDraftInsertDto.customerId,
            deliveryStatus: DeliveryStatus.Pending,
            quantityPrescription: i.quantity,
            type: TicketProductType.Prescription,
          }
          return ticketProduct
        })
        await this.ticketProductManager.insertMany(manager, ticketProductListInsert)
      }

      if (ticketOrderProcedureDraftListDto) {
        const ticketProcedureListInsert = ticketOrderProcedureDraftListDto.map((i) => {
          const ticketProcedure: TicketProcedureInsertType = {
            ...i,
            oid,
            ticketId: ticket.id,
            customerId: ticketOrderDraftInsertDto.customerId,
            startedAt: ticketOrderDraftInsertDto.registeredAt,
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

      if (ticketAttributeDraftListDto.length) {
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
