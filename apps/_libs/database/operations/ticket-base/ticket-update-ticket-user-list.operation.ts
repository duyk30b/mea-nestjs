import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESObject } from '../../../common/helpers/object.helper'
import { TicketUser } from '../../entities'
import { CommissionCalculatorType, InteractType } from '../../entities/commission.entity'
import { TicketUserInsertType } from '../../entities/ticket-user.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { CommissionManager, TicketManager, TicketUserManager } from '../../managers'

@Injectable()
export class TicketUpdateTicketUserListOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketUserManager: TicketUserManager,
    private commissionManager: CommissionManager
  ) { }

  async changeList(
    information: {
      oid: number
      ticketId: number
      interactType: InteractType
      interactId: number
      ticketItemId: number
    },
    payload: { roleId: number; userId: number }[]
  ) {
    const { oid, ticketId } = information
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: {
            IN: [
              TicketStatus.Schedule,
              TicketStatus.Draft,
              TicketStatus.Executing,
              TicketStatus.Approved,
            ],
          },
        },
        { updatedAt: Date.now() }
      )

      const commissionList = await this.commissionManager.findManyBy(manager, {
        oid,
        interactType: information.interactType,
        interactId: information.interactId,
      })
      const commissionMap = ESObject.keyBy(commissionList, 'roleId')

      // === 1. DELETE EMPTY USERID ===
      const roleIdRemoveList = payload.filter((i) => !i.userId).map((i) => i.roleId)
      if (roleIdRemoveList.length) {
        const deleteResult = await this.ticketUserManager.delete(manager, {
          oid,
          ticketId,
          roleId: { IN: roleIdRemoveList },
        })
      }

      // === 2. UPDATE EXIST
      let ticketUserUpdate: TicketUser[] = []
      const payloadUpdate = payload.filter((i) => !!i.userId)
      if (payloadUpdate.length) {
        const ticketUserUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE "TicketUser" AS "tu"
          SET "userId" = temp."userId"
          FROM (VALUES `
          + payloadUpdate.map(({ roleId, userId }) => `(${roleId}, ${userId})`).join(', ')
          + `   ) AS temp("roleId", "userId")
          WHERE   "tu"."oid" = ${oid} 
              AND "tu"."ticketId" = ${ticketId} 
              AND "tu"."roleId" = temp."roleId" 
          RETURNING tu.*; 
          `
        )
        ticketUserUpdate = TicketUser.fromRaws(ticketUserUpdateResult[0])
      }

      let ticketUserInsert: TicketUser[] = []
      const roleIdUpdate = ticketUserUpdate.map((i) => i.roleId)
      const payloadInsert = payload.filter((i) => {
        if (!i.userId) return false
        if (roleIdUpdate.includes(i.roleId)) return false
        return true
      })

      // === 2. INSERT NEW
      if (payloadInsert.length) {
        let interactMoney = 0
        if (information.interactType === InteractType.Ticket) {
          interactMoney = 0
        }

        const ticketUserInsertDto = payloadInsert.map((i) => {
          let commissionMoney = 0
          let commissionPercent = 0
          const commissionCalculatorType = commissionMap[i.roleId].commissionCalculatorType
          if (commissionCalculatorType === CommissionCalculatorType.VND) {
            commissionPercent = 0
            commissionMoney = commissionMap[i.roleId]?.commissionValue || 0
          }
          if (commissionCalculatorType === CommissionCalculatorType.PercentActual) {
            commissionPercent = commissionMap[i.roleId]?.commissionValue || 0
            commissionMoney = Math.floor((interactMoney * commissionPercent) / 100)
          }
          if (commissionCalculatorType === CommissionCalculatorType.PercentExpected) {
            commissionPercent = commissionMap[i.roleId]?.commissionValue || 0
            commissionMoney = Math.floor((interactMoney * commissionPercent) / 100)
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
        ticketUserInsert = await this.ticketUserManager.insertManyAndReturnEntity(
          manager,
          ticketUserInsertDto
        )
      }
      return
    })
  }
}
