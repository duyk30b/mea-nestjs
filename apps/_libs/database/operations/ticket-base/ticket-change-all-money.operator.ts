import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { DeliveryStatus, DiscountType, PaymentMoneyStatus } from '../../common/variable'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  TicketLaboratoryManager,
  TicketManager,
  TicketProcedureManager,
  TicketProductManager,
  TicketRadiologyManager,
} from '../../managers'
import { TicketCalculatorMoney } from './ticket-calculator-money.operator'
import { TicketUpdateCommissionTicketUserOperator } from './ticket-update-commission-ticket-user.operator'

export type TicketItemChangeMoney = {
  id: number
  quantity?: number
  discountMoney: number
  discountPercent: number
  discountType: DiscountType
}

@Injectable()
export class TicketChangeAllMoneyOperator {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketProductManager: TicketProductManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketRadiologyManager: TicketRadiologyManager,
    private ticketCalculatorMoney: TicketCalculatorMoney,
    private ticketUpdateCommissionTicketUserOperator: TicketUpdateCommissionTicketUserOperator
  ) { }

  async changeItemMoney(options: {
    oid: number
    ticketUpdate: Partial<TicketItemChangeMoney>
    ticketProcedureUpdate: TicketItemChangeMoney[]
    ticketProductUpdate: TicketItemChangeMoney[]
    ticketLaboratoryUpdate: TicketItemChangeMoney[]
    ticketRadiologyUpdate: TicketItemChangeMoney[]
  }) {
    const { oid } = options
    const ticketId = options.ticketUpdate.id

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )
      const ticketProductModifiedList = await this.ticketProductManager.bulkUpdate({
        manager,
        condition: {
          oid,
          ticketId,
          deliveryStatus: DeliveryStatus.Pending,
          paymentMoneyStatus: { IN: [PaymentMoneyStatus.NoEffect, PaymentMoneyStatus.Pending] },
        },
        compare: ['id'],
        tempList: options.ticketProductUpdate,
        update: ['quantity', 'discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: true },
      })

      const ticketProcedureModifiedList = await this.ticketProcedureManager.bulkUpdate({
        manager,
        condition: {
          oid,
          ticketId,
          paymentMoneyStatus: { IN: [PaymentMoneyStatus.NoEffect, PaymentMoneyStatus.Pending] },
        },
        compare: ['id'],
        tempList: options.ticketProcedureUpdate,
        update: ['quantity', 'discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: true },
      })

      const ticketLaboratoryModifiedList = await this.ticketLaboratoryManager.bulkUpdate({
        manager,
        condition: {
          oid,
          ticketId,
          paymentMoneyStatus: { IN: [PaymentMoneyStatus.NoEffect, PaymentMoneyStatus.Pending] },
        },
        compare: ['id'],
        tempList: options.ticketLaboratoryUpdate,
        update: ['discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: true },
      })

      const ticketRadiologyModifiedList = await this.ticketRadiologyManager.bulkUpdate({
        manager,
        condition: {
          oid,
          ticketId,
          paymentMoneyStatus: { IN: [PaymentMoneyStatus.NoEffect, PaymentMoneyStatus.Pending] },
        },
        compare: ['id'],
        tempList: options.ticketRadiologyUpdate,
        update: ['discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: true },
      })

      const ticketProductList = await this.ticketProductManager.findManyBy(manager, {
        oid,
        ticketId,
      })
      const ticketProcedureList = await this.ticketProcedureManager.findManyBy(manager, {
        oid,
        ticketId,
      })
      const ticketLaboratoryList = await this.ticketLaboratoryManager.findManyBy(manager, {
        oid,
        ticketId,
      })
      const ticketRadiologyList = await this.ticketRadiologyManager.findManyBy(manager, {
        oid,
        ticketId,
      })

      const { ticketUserModifiedList } =
        await this.ticketUpdateCommissionTicketUserOperator.updateCommissionTicketUser({
          manager,
          oid,
          ticketId,
          ticketOrigin,
          ticketLaboratoryList,
          ticketProcedureList,
          ticketRadiologyList,
          ticketProductList,
        })

      const ticketMoneyBody = this.ticketCalculatorMoney.reCalculatorMoney({
        oid,
        ticketOrigin,
        ticketProcedureList,
        ticketProductList,
        ticketLaboratoryList,
        ticketRadiologyList,
        ticketUserList: ticketUserModifiedList,
      })

      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketOrigin.id },
        ticketMoneyBody
      )
      return { ticket }
    })

    return transaction
  }
}
