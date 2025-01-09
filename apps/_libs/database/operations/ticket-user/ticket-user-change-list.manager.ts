import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { ESObject } from '../../../common/helpers/object.helper'
import { TicketUser } from '../../entities'
import { CommissionCalculatorType, InteractType } from '../../entities/commission.entity'
import { TicketUserInsertType } from '../../entities/ticket-user.entity'
import { CommissionManager, TicketUserManager } from '../../managers'

@Injectable()
export class TicketUserChangeListManager {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketUserManager: TicketUserManager,
    private commissionManager: CommissionManager
  ) { }

  async insertList(options: {
    manager?: EntityManager
    information: {
      oid: number
      ticketId: number
      interactType: InteractType
      interactId: number
      ticketItemId: number
      ticketItemActualPrice: number
      ticketItemExpectedPrice: number
    }
    dataInsert?: { roleId: number; userId: number }[]
  }) {
    const { manager, information, dataInsert } = options
    const { oid, ticketId } = information
    let ticketUserInsertList: TicketUser[] = []
    // === 2. INSERT NEW
    if (dataInsert.length) {
      const commissionList = await this.commissionManager.findManyBy(manager, {
        oid,
        interactType: information.interactType,
        interactId: information.interactId,
      })
      const commissionMap = ESObject.keyBy(commissionList, 'roleId')

      const ticketUserInsertDto = dataInsert.map((i) => {
        let commissionMoney = 0
        let commissionPercent = 0
        const commissionCalculatorType = commissionMap[i.roleId].commissionCalculatorType
        if (commissionCalculatorType === CommissionCalculatorType.VND) {
          commissionPercent = 0
          commissionMoney = commissionMap[i.roleId]?.commissionValue || 0
        }
        if (commissionCalculatorType === CommissionCalculatorType.PercentActual) {
          commissionPercent = commissionMap[i.roleId]?.commissionValue || 0
          commissionMoney = Math.floor(
            (information.ticketItemActualPrice * commissionPercent) / 100
          )
        }
        if (commissionCalculatorType === CommissionCalculatorType.PercentExpected) {
          commissionPercent = commissionMap[i.roleId]?.commissionValue || 0
          commissionMoney = Math.floor(
            (information.ticketItemExpectedPrice * commissionPercent) / 100
          )
        }

        const insertDto: TicketUserInsertType = {
          ...i,
          oid,
          ticketId,
          interactId: information.interactId,
          interactType: information.interactType,
          ticketItemId: information.ticketItemId,
          createdAt: Date.now(),
          commissionCalculatorType,
          commissionMoney,
          commissionPercent,
        }
        return insertDto
      })
      ticketUserInsertList = await this.ticketUserManager.insertManyAndReturnEntity(
        manager,
        ticketUserInsertDto
      )
    }
    return ticketUserInsertList
  }

  async changeList(options: {
    manager: EntityManager
    information: {
      oid: number
      ticketId: number
      interactType: InteractType
      interactId: number
      ticketItemId: number
      ticketItemActualPrice: number
      ticketItemExpectedPrice: number
    }
    dataChange?: { roleId: number; userId: number }[]
  }) {
    const { manager, information, dataChange } = options
    const { oid, ticketId } = information

    let ticketUserInsertList: TicketUser[] = []
    let ticketUserUpdateList: TicketUser[] = []
    let ticketUserDestroyList: TicketUser[] = []

    // === 1. DELETE EMPTY USERID ===
    const dataDestroy = dataChange.filter((i) => !i.userId)
    if (dataDestroy.length) {
      ticketUserDestroyList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
        oid,
        ticketId,
        interactType: information.interactType,
        ticketItemId: information.ticketItemId,
        roleId: { IN: dataDestroy.map((i) => i.roleId) },
      })
    }

    const dataUpdate = dataChange.filter((i) => !!i.userId)
    if (dataUpdate.length) {
      const queryUpdateResult: [any[], number] = await manager.query(
        `
        UPDATE  "TicketUser"
        SET     "userId" = temp."userId"
        FROM (VALUES `
        + dataUpdate.map(({ roleId, userId }) => `(${roleId}, ${userId})`).join(', ')
        + `   ) AS temp("roleId", "userId")
        WHERE   "TicketUser"."oid" = ${oid} 
            AND "TicketUser"."ticketId" = ${ticketId} 
            AND "TicketUser"."interactType" = ${information.interactType} 
            AND "TicketUser"."ticketItemId" = ${information.ticketItemId} 
            AND "TicketUser"."roleId" = temp."roleId" 
        RETURNING "TicketUser".*; 
        `
      )
      ticketUserUpdateList = TicketUser.fromRaws(queryUpdateResult[0])
    }

    const roleIdUpdate = ticketUserUpdateList.map((i) => i.roleId)
    const dataInsert = dataChange.filter((i) => {
      if (!i.userId) return false
      if (roleIdUpdate.includes(i.roleId)) return false
      return true
    })
    if (dataInsert.length) {
      ticketUserInsertList = await this.insertList({
        manager,
        information,
        dataInsert,
      })
    }
    return { ticketUserDestroyList, ticketUserUpdateList, ticketUserInsertList }
  }
}
