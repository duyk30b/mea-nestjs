import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { DeliveryStatus, DiscountType, PaymentMoneyStatus } from '../../common/variable'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  TicketLaboratoryManager,
  TicketLaboratoryRepository,
  TicketManager,
  TicketProcedureManager,
  TicketProcedureRepository,
  TicketProductManager,
  TicketProductRepository,
  TicketRadiologyManager,
  TicketRadiologyRepository,
} from '../../repositories'
import { TicketCalculatorMoney } from './ticket-calculator-money.operator'
import { TicketUpdateCommissionTicketUserOperator } from './ticket-update-commission-ticket-user.operator'

export type TicketItemChangeMoney = {
  id: string
  quantity?: number
  discountMoney: number
  discountPercent: number
  discountType: DiscountType
  actualPrice: number
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
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketLaboratoryRepository: TicketLaboratoryRepository,
    private ticketRadiologyRepository: TicketRadiologyRepository,
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
      const ticketProductModifiedList = await this.ticketProductRepository.managerBulkUpdate({
        manager,
        condition: {
          oid,
          ticketId,
          deliveryStatus: DeliveryStatus.Pending,
          paymentMoneyStatus: {
            IN: [PaymentMoneyStatus.PendingPaid],
          },
        },
        compare: { id: { cast: 'bigint' } },
        tempList: options.ticketProductUpdate,
        update: ['quantity', 'discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: true },
      })

      const ticketProcedureModifiedList = await this.ticketProcedureRepository.managerBulkUpdate({
        manager,
        condition: {
          oid,
          ticketId,
          paymentMoneyStatus: {
            IN: [PaymentMoneyStatus.PendingPaid],
          },
        },
        compare: { id: { cast: 'bigint' } },
        tempList: options.ticketProcedureUpdate,
        update: ['quantity', 'discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: true },
      })

      const ticketLaboratoryModifiedList = await this.ticketLaboratoryRepository.managerBulkUpdate({
        manager,
        condition: {
          oid,
          ticketId,
          paymentMoneyStatus: {
            IN: [PaymentMoneyStatus.PendingPaid],
          },
        },
        compare: { id: { cast: 'bigint' } },
        tempList: options.ticketLaboratoryUpdate,
        update: ['discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: true },
      })

      const ticketRadiologyModifiedList = await this.ticketRadiologyRepository.managerBulkUpdate({
        manager,
        condition: {
          oid,
          ticketId,
          paymentMoneyStatus: {
            IN: [PaymentMoneyStatus.PendingPaid],
          },
        },
        compare: { id: { cast: 'bigint' } },
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

      const ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketOrigin.id },
        ticketMoneyBody
      )
      return { ticketModified }
    })

    return transaction
  }
}
