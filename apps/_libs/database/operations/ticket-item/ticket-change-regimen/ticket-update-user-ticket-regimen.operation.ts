import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { TicketRegimen, TicketUser } from '../../../entities'
import { PositionType } from '../../../entities/position.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import {
  TicketRegimenRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../ticket-change-user/ticket-user.common'

export type TicketRegimenUpdateUserDtoType = Pick<TicketUser, 'positionId' | 'userId'>

@Injectable()
export class TicketUpdateUserTicketRegimenOperation {
  constructor(
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketUserCommon: TicketUserCommon,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateUserTicketRegimen<T extends TicketRegimenUpdateUserDtoType>(obj: {
    oid: number
    ticketId: string
    ticketRegimenId: string
    ticketUserRequestList?: NoExtra<TicketRegimenUpdateUserDtoType, T>[]
    positionType: PositionType
  }) {
    const { oid, ticketId, ticketRegimenId, ticketUserRequestList } = obj
    const PREFIX = `ticketId=${ticketId} updateTicketRegimen failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      const ticketRegimenOrigin = await this.ticketRegimenRepository.managerFindOneBy(manager, {
        oid,
        ticketId,
        id: ticketRegimenId,
      })

      const ticketUserDestroyedList = await this.ticketUserRepository.managerDelete(manager, {
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
        ticketRegimenModified = await this.ticketRegimenRepository.managerUpdateOne(
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
