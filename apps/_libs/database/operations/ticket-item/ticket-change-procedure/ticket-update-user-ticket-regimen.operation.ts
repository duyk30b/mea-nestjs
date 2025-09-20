import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { TicketRegimen, TicketUser } from '../../../entities'
import { PositionType } from '../../../entities/position.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketRegimenManager, TicketUserManager } from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../ticket-change-user/ticket-user.common'

export type TicketRegimenUpdateUserDtoType = Pick<TicketUser, 'positionId' | 'userId'>

@Injectable()
export class TicketUpdateUserTicketRegimenOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketRegimenManager: TicketRegimenManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketUserManager: TicketUserManager,
    private ticketUserCommon: TicketUserCommon
  ) { }

  async updateUserTicketRegimen<T extends TicketRegimenUpdateUserDtoType>(obj: {
    oid: number
    ticketId: number
    ticketRegimenId: number
    ticketUserRequestList?: NoExtra<TicketRegimenUpdateUserDtoType, T>[]
    positionType: PositionType
  }) {
    const { oid, ticketId, ticketRegimenId, ticketUserRequestList } = obj
    const PREFIX = `ticketId=${ticketId} updateTicketRegimen failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      const ticketRegimenOrigin = await this.ticketRegimenManager.findOneBy(manager, {
        oid,
        ticketId,
        id: ticketRegimenId,
      })

      const ticketUserDestroyedList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
        oid,
        ticketId,
        positionType: obj.positionType,
        ticketItemId: ticketRegimenId,
      })
      const ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
        manager,
        createdAt: Date.now(),
        oid,
        ticketId,
        ticketUserDtoList: ticketUserRequestList.map((i) => {
          return {
            positionId: i.positionId,
            userId: i.userId,
            quantity: 1,
            ticketItemId: ticketRegimenId,
            ticketItemChildId: 0,
            positionInteractId: ticketRegimenOrigin.regimenId,
            ticketItemExpectedPrice: ticketRegimenOrigin.expectedPrice,
            ticketItemActualPrice: ticketRegimenOrigin.actualPrice,
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

      let ticketRegimenModified: TicketRegimen = ticketRegimenOrigin
      let ticketModified: Ticket = ticketOrigin

      if (commissionMoneyChange != 0) {
        ticketRegimenModified = await this.ticketRegimenManager.updateOneAndReturnEntity(
          manager,
          { oid, ticketId, id: ticketRegimenId },
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
        ticketRegimenModified,
        ticketUserCreatedList,
        ticketUserDestroyedList,
      }
    })

    return transaction
  }
}
