import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { TicketUser } from '../../../entities'
import { PositionType } from '../../../entities/position.entity'
import TicketProcedure from '../../../entities/ticket-procedure.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProcedureManager, TicketUserManager } from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../ticket-change-user/ticket-user.common'

export type TicketProcedureUpdateUserDtoType = Pick<TicketUser, 'positionId' | 'userId'>

@Injectable()
export class TicketUpdateUserTicketProcedureOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketUserManager: TicketUserManager,
    private ticketUserCommon: TicketUserCommon
  ) { }

  async updateUserTicketProcedure<T extends TicketProcedureUpdateUserDtoType>(params: {
    oid: number
    ticketId: number
    ticketProcedureId: number
    positionType: PositionType
    ticketUserUpdateList: NoExtra<TicketProcedureUpdateUserDtoType, T>[]
  }) {
    const { oid, ticketId, ticketProcedureId, positionType, ticketUserUpdateList } = params
    const PREFIX = `ticketId=${ticketId} updateUserTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketProcedureOrigin = await this.ticketProcedureManager.findOneBy(manager, {
        oid,
        ticketId,
        id: ticketProcedureId,
      })

      const ticketUserDestroyedList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
        oid,
        ticketId,
        positionType,
        ticketItemId: ticketProcedureId,
      })

      const ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
        manager,
        createdAt: Date.now(),
        oid,
        ticketId,
        ticketUserDtoList: ticketUserUpdateList.map((i) => {
          return {
            positionId: i.positionId,
            userId: i.userId,
            quantity: 1,
            ticketItemId: ticketProcedureId,
            ticketItemChildId: 0,
            positionInteractId: ticketProcedureOrigin.procedureId,
            ticketItemExpectedPrice: ticketProcedureOrigin.expectedPrice,
            ticketItemActualPrice: ticketProcedureOrigin.actualPrice,
          }
        }),
      })

      const commissionMoneyChange =
        ticketUserCreatedList.reduce((acc, item) => {
          return acc + item.quantity * item.commissionMoney
        }, 0)
        - ticketUserDestroyedList.reduce((acc, item) => {
          return acc + item.quantity * item.commissionMoney
        }, 0)

      let ticketProcedureModified: TicketProcedure = ticketProcedureOrigin
      let ticketModified: Ticket = ticketOrigin

      // === 5. UPDATE TICKET: MONEY  ===
      if (commissionMoneyChange != 0) {
        ticketProcedureModified = await this.ticketProcedureManager.updateOneAndReturnEntity(
          manager,
          { oid, ticketId, id: ticketProcedureId },
          { commissionAmount: () => `"commissionAmount" + ${commissionMoneyChange}` }
        )

        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            commissionMoneyAdd: commissionMoneyChange,
          },
        })
      }
      return {
        ticketModified,
        ticketProcedureModified,
        ticketUserCreatedList,
        ticketUserDestroyedList,
      }
    })

    return transaction
  }
}
