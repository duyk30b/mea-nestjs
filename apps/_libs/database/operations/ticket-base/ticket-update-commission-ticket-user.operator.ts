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
import { PositionType } from '../../entities/position.entity'
import { TicketUserManager, TicketUserRepository } from '../../repositories'

@Injectable()
export class TicketUpdateCommissionTicketUserOperator {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketUserManager: TicketUserManager,
    private ticketUserRepository: TicketUserRepository
  ) { }

  async updateCommissionTicketUser(options: {
    manager: EntityManager
    oid: number
    ticketId: string
    ticketOrigin: Ticket
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

    const ticketUserList = await this.ticketUserManager.findManyBy(manager, {
      oid,
      ticketId,
    })
    const ticketProcedureMap = ESArray.arrayToKeyValue(ticketProcedureList, 'id')
    const ticketProductMap = ESArray.arrayToKeyValue(ticketProductList, 'id')
    const ticketLaboratoryMap = ESArray.arrayToKeyValue(ticketLaboratoryList, 'id')
    const ticketRadiologyMap = ESArray.arrayToKeyValue(ticketRadiologyList, 'id')

    const ticketUserRemoveList: TicketUser[] = []

    ticketUserList.forEach((tu) => {
      let actualPrice = 0
      let expectedPrice = 0
      let quantity = 0

      if (tu.positionType === PositionType.Reception) {
        expectedPrice = ticketOrigin.totalMoney + ticketOrigin.discountMoney
        actualPrice = ticketOrigin.totalMoney
      }

      if ([PositionType.ProcedureRequest, PositionType.ProcedureResult].includes(tu.positionType)) {
        const ticketItem = ticketProcedureMap[tu.ticketItemId]
        if (!ticketItem) ticketUserRemoveList.push(tu)
        actualPrice = ticketItem.actualPrice
        expectedPrice = ticketItem.expectedPrice
        quantity = ticketItem.quantity
      }
      if (tu.positionType === PositionType.ProductRequest) {
        const ticketItem = ticketProductMap[tu.ticketItemId]
        if (!ticketItem) ticketUserRemoveList.push(tu)
        actualPrice = Math.round(ticketItem.unitActualPrice / ticketItem.unitRate)
        expectedPrice = Math.round(ticketItem.unitExpectedPrice / ticketItem.unitRate)
        quantity = ticketItem.unitQuantity * ticketItem.unitRate
      }
      if (tu.positionType === PositionType.LaboratoryRequest) {
        const ticketItem = ticketLaboratoryMap[tu.ticketItemId]
        if (!ticketItem) ticketUserRemoveList.push(tu)
        actualPrice = ticketItem.actualPrice
        expectedPrice = ticketItem.expectedPrice
        quantity = 1
      }
      if ([PositionType.RadiologyRequest, PositionType.RadiologyResult].includes(tu.positionType)) {
        const ticketItem = ticketRadiologyMap[tu.ticketItemId]
        if (!ticketItem) ticketUserRemoveList.push(tu)
        actualPrice = ticketItem.actualPrice
        expectedPrice = ticketItem.expectedPrice
        quantity = 1
      }

      tu.ticketItemActualPrice = actualPrice || 0
      tu.ticketItemExpectedPrice = expectedPrice || 0
      tu.quantity = quantity || 0

      TicketUser.reCalculatorCommission(tu)
    })

    const ticketUserModifiedList = await this.ticketUserRepository.managerBulkUpdate({
      manager,
      tempList: ticketUserList,
      compare: { id: { cast: 'bigint' } },
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
}
