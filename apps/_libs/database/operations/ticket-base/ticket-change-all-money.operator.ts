import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { ESArray } from '../../../common/helpers'
import { DeliveryStatus, DiscountType } from '../../common/variable'
import { TicketUser } from '../../entities'
import { PositionInteractType } from '../../entities/position.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  TicketLaboratoryManager,
  TicketManager,
  TicketProcedureManager,
  TicketProductManager,
  TicketRadiologyManager,
} from '../../managers'
import { TicketUserManager } from '../../repositories'
import { TicketCalculatorMoney } from './ticket-calculator-money.operator'

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
    private ticketUserManager: TicketUserManager,
    private ticketCalculatorMoney: TicketCalculatorMoney
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
      let ticketProductModifiedList = await this.ticketProductManager.bulkUpdate({
        manager,
        condition: { oid, ticketId, deliveryStatus: DeliveryStatus.Pending },
        compare: ['id'],
        tempList: options.ticketProductUpdate,
        update: ['quantity', 'discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: false },
      })
      if (ticketProductModifiedList.length !== options.ticketProductUpdate.length) {
        // vì không được update thằng đã gửi hàng
        ticketProductModifiedList = await this.ticketProductManager.findManyBy(manager, {
          oid,
          ticketId,
        })
      }
      const ticketProductModifiedMap = ESArray.arrayToKeyValue(ticketProductModifiedList, 'id')

      const ticketProcedureModifiedList = await this.ticketProcedureManager.bulkUpdate({
        manager,
        condition: { oid, ticketId },
        compare: ['id'],
        tempList: options.ticketProcedureUpdate,
        update: ['quantity', 'discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: true },
      })
      const ticketProcedureModifiedMap = ESArray.arrayToKeyValue(ticketProcedureModifiedList, 'id')

      const ticketLaboratoryModifiedList = await this.ticketLaboratoryManager.bulkUpdate({
        manager,
        condition: { oid, ticketId },
        compare: ['id'],
        tempList: options.ticketLaboratoryUpdate,
        update: ['discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: true },
      })
      const ticketLaboratoryModifiedMap = ESArray.arrayToKeyValue(
        ticketLaboratoryModifiedList,
        'id'
      )

      const ticketRadiologyModifiedList = await this.ticketRadiologyManager.bulkUpdate({
        manager,
        condition: { oid, ticketId },
        compare: ['id'],
        tempList: options.ticketRadiologyUpdate,
        update: ['discountMoney', 'discountPercent', 'discountType', 'actualPrice'],
        options: { requireEqualLength: true },
      })
      const ticketRadiologyModifiedMap = ESArray.arrayToKeyValue(ticketRadiologyModifiedList, 'id')

      const ticketUserListOrigin = await this.ticketUserManager.findManyBy(manager, {
        oid,
        ticketId,
      })

      const ticketUserListUpdate = ticketUserListOrigin.map((tu) => {
        if (tu.positionType === PositionInteractType.Procedure) {
          const ticketItem = ticketProcedureModifiedMap[tu.ticketItemId]
          return TicketUser.changeTicketItemMoney(tu, {
            actualPrice: ticketItem.actualPrice,
            expectedPrice: ticketItem.expectedPrice,
            quantity: ticketItem.quantity,
          })
        }
        if (tu.positionType === PositionInteractType.Product) {
          const ticketItem = ticketProductModifiedMap[tu.ticketItemId]
          return TicketUser.changeTicketItemMoney(tu, {
            actualPrice: ticketItem.actualPrice,
            expectedPrice: ticketItem.expectedPrice,
            quantity: ticketItem.quantity,
          })
        }
        if (tu.positionType === PositionInteractType.Laboratory) {
          const ticketItem = ticketLaboratoryModifiedMap[tu.ticketItemId]
          return TicketUser.changeTicketItemMoney(tu, {
            actualPrice: ticketItem.actualPrice,
            expectedPrice: ticketItem.expectedPrice,
            quantity: 1,
          })
        }
        if (tu.positionType === PositionInteractType.Radiology) {
          const ticketItem = ticketRadiologyModifiedMap[tu.ticketItemId]
          return TicketUser.changeTicketItemMoney(tu, {
            actualPrice: ticketItem.actualPrice,
            expectedPrice: ticketItem.expectedPrice,
            quantity: 1,
          })
        }
        return tu
      })

      const ticketUserModifiedList = await this.ticketUserManager.bulkUpdate({
        manager,
        tempList: ticketUserListUpdate,
        compare: ['id'],
        condition: { oid },
        update: [
          'ticketItemExpectedPrice',
          'ticketItemActualPrice',
          'quantity',
          'commissionCalculatorType',
          'commissionMoney',
          'commissionPercentActual',
          'commissionPercentExpected',
        ],
      })

      const ticketFix = this.ticketCalculatorMoney.reCalculatorMoney({
        oid,
        ticketOrigin,
        ticketProcedureList: ticketProcedureModifiedList,
        ticketProductList: ticketProductModifiedList,
        ticketLaboratoryList: ticketLaboratoryModifiedList,
        ticketRadiologyList: ticketRadiologyModifiedList,
        ticketUserList: ticketUserModifiedList,
      })

      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketOrigin.id },
        ticketFix as any
      )
      return { ticket }
    })

    return transaction
  }
}
