import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { ESArray } from '../../../common/helpers'
import {
  Ticket,
  TicketLaboratory,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
  TicketUser,
} from '../../entities'
import { CommissionCalculatorType, PositionInteractType } from '../../entities/position.entity'
import { TicketProductType } from '../../entities/ticket-product.entity'
import { TicketUserInsertType } from '../../entities/ticket-user.entity'
import { TicketUserManager } from '../../repositories'

@Injectable()
export class TicketUpdateCommissionTicketUserOperator {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketUserManager: TicketUserManager
  ) { }

  async updateCommissionTicketUser(options: {
    manager: EntityManager
    oid: number
    ticketId: number
    ticketOrigin: Ticket
    ticketUserOriginList?: TicketUser[]
    ticketProcedureList: TicketProcedure[]
    ticketProductList: TicketProduct[]
    ticketLaboratoryList: TicketLaboratory[]
    ticketRadiologyList: TicketRadiology[]
  }) {
    const {
      manager,
      oid,
      ticketId,
      ticketOrigin,
      ticketLaboratoryList,
      ticketProcedureList,
      ticketProductList,
      ticketRadiologyList,
    } = options

    let ticketUserOriginList = options.ticketUserOriginList
    if (!ticketUserOriginList) {
      ticketUserOriginList = await this.ticketUserManager.findManyBy(manager, {
        oid,
        ticketId,
      })
    }
    const ticketProcedureMap = ESArray.arrayToKeyValue(ticketProcedureList, 'id')
    const ticketProductMap = ESArray.arrayToKeyValue(ticketProductList, 'id')
    const ticketLaboratoryMap = ESArray.arrayToKeyValue(ticketLaboratoryList, 'id')
    const ticketRadiologyMap = ESArray.arrayToKeyValue(ticketRadiologyList, 'id')

    const ticketUserRemoveList: TicketUser[] = []
    const ticketUserListUpdate = ticketUserOriginList.map((tu) => {
      let actualPrice = 0
      let expectedPrice = 0
      let quantity = 0

      if (tu.positionType === PositionInteractType.Procedure) {
        const ticketItem = ticketProcedureMap[tu.ticketItemId]
        if (!ticketItem) ticketUserRemoveList.push(tu)
        actualPrice = ticketItem.actualPrice
        expectedPrice = ticketItem.expectedPrice
        quantity = ticketItem.quantity
      }
      if (tu.positionType === PositionInteractType.Product) {
        const ticketItem = ticketProductMap[tu.ticketItemId]
        if (!ticketItem) ticketUserRemoveList.push(tu)
        actualPrice = ticketItem.actualPrice
        expectedPrice = ticketItem.expectedPrice
        quantity = ticketItem.quantity
      }
      if (tu.positionType === PositionInteractType.Laboratory) {
        const ticketItem = ticketLaboratoryMap[tu.ticketItemId]
        if (!ticketItem) ticketUserRemoveList.push(tu)
        actualPrice = ticketItem.actualPrice
        expectedPrice = ticketItem.expectedPrice
        quantity = 1
      }
      if (tu.positionType === PositionInteractType.Radiology) {
        const ticketItem = ticketRadiologyMap[tu.ticketItemId]
        if (!ticketItem) ticketUserRemoveList.push(tu)
        actualPrice = ticketItem.actualPrice
        expectedPrice = ticketItem.expectedPrice
        quantity = 1
      }

      if (tu.positionType === PositionInteractType.Ticket) {
        expectedPrice = ticketOrigin.totalMoney + ticketOrigin.discountMoney
        actualPrice = ticketOrigin.totalMoney
      }

      if (tu.positionType === PositionInteractType.ConsumableList) {
        const ticketProductConsumableList = ticketProductList.filter((i) => {
          return i.type === TicketProductType.Consumable
        })
        expectedPrice = ticketProductConsumableList.reduce((acc, cur) => {
          return acc + cur.expectedPrice * cur.quantity
        }, 0)
        actualPrice = ticketProductConsumableList.reduce((acc, cur) => {
          return acc + cur.actualPrice * cur.quantity
        }, 0)
        quantity = 1
      }
      if (tu.positionType === PositionInteractType.PrescriptionList) {
        const ticketProductPrescriptionList = ticketProductList.filter((i) => {
          return i.type === TicketProductType.Prescription
        })
        expectedPrice = ticketProductPrescriptionList.reduce((acc, cur) => {
          return acc + cur.expectedPrice * cur.quantity
        }, 0)
        actualPrice = ticketProductPrescriptionList.reduce((acc, cur) => {
          return acc + cur.actualPrice * cur.quantity
        }, 0)
        quantity = 1
      }

      const ticketUserDto = this.reCalculatorCommission(tu, {
        actualPrice: actualPrice || 0,
        expectedPrice: expectedPrice || 0,
        quantity: quantity || 0,
      })

      return ticketUserDto
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

    let ticketUserDestroyedList: TicketUser[] = []
    if (ticketUserRemoveList.length) {
      ticketUserDestroyedList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
        oid,
        id: { IN: ticketUserRemoveList.map((i) => i.id) },
      })
    }

    return { ticketUserModifiedList, ticketUserDestroyedList }
  }

  reCalculatorCommission(
    ticketUserOrigin: TicketUser,
    ticketItem: { quantity: number; expectedPrice: number; actualPrice: number }
  ) {
    const quantity = ticketItem.quantity
    const ticketItemExpectedPrice = ticketItem.expectedPrice
    const ticketItemActualPrice = ticketItem.actualPrice

    let commissionMoney = 0
    let commissionPercentActual = 0
    let commissionPercentExpected = 0

    if (ticketUserOrigin.commissionCalculatorType === CommissionCalculatorType.VND) {
      commissionMoney = ticketUserOrigin.commissionMoney
      commissionPercentExpected =
        ticketItemExpectedPrice === 0
          ? 0
          : Math.floor((commissionMoney * 100) / ticketItemExpectedPrice)
      commissionPercentActual =
        ticketItemActualPrice === 0
          ? 0
          : Math.floor((commissionMoney * 100) / ticketItemActualPrice)
    }
    if (ticketUserOrigin.commissionCalculatorType === CommissionCalculatorType.PercentExpected) {
      commissionPercentExpected = ticketUserOrigin.commissionPercentExpected || 0
      commissionMoney = Math.floor((ticketItemExpectedPrice * commissionPercentExpected) / 100)
      commissionPercentActual =
        ticketItemActualPrice === 0
          ? 0
          : Math.floor((commissionMoney * 100) / ticketItemActualPrice)
    }
    if (ticketUserOrigin.commissionCalculatorType === CommissionCalculatorType.PercentActual) {
      commissionPercentActual = ticketUserOrigin.commissionPercentActual || 0
      commissionMoney = Math.floor((ticketItem.actualPrice * commissionPercentActual) / 100)
      commissionPercentExpected =
        ticketItemExpectedPrice === 0
          ? 0
          : Math.floor((commissionMoney * 100) / ticketItemExpectedPrice)
    }

    const ticketUserFix = TicketUser.fromRaw(ticketUserOrigin)
    ticketUserFix.quantity = quantity
    ticketUserFix.ticketItemExpectedPrice = ticketItemExpectedPrice
    ticketUserFix.ticketItemActualPrice = ticketItemActualPrice
    ticketUserFix.commissionMoney = commissionMoney
    ticketUserFix.commissionPercentActual = commissionPercentActual
    ticketUserFix.commissionPercentExpected = commissionPercentExpected

    const ticketUserDto: TicketUserInsertType & { id: number } = {
      id: ticketUserOrigin.id,
      oid: ticketUserOrigin.oid,
      ticketId: ticketUserOrigin.ticketId,
      roleId: ticketUserOrigin.roleId,
      userId: ticketUserOrigin.userId,
      positionInteractId: ticketUserOrigin.positionInteractId,
      positionType: ticketUserOrigin.positionType,
      ticketItemId: ticketUserOrigin.ticketItemId,
      createdAt: ticketUserOrigin.createdAt,

      commissionCalculatorType: ticketUserOrigin.commissionCalculatorType,

      ticketItemExpectedPrice,
      ticketItemActualPrice,
      quantity,
      commissionMoney,
      commissionPercentActual,
      commissionPercentExpected,
    }
    return ticketUserDto
  }
}
