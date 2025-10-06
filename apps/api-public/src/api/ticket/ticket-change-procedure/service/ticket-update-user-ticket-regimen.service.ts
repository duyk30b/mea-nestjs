import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { TicketRegimen, TicketUser } from '../../../../../../_libs/database/entities'
import { PositionType } from '../../../../../../_libs/database/entities/position.entity'
import Ticket, { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../../../../../../_libs/database/operations/ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../../../../../../_libs/database/operations/ticket-item/ticket-change-user/ticket-user.common'
import {
  TicketRegimenRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { TicketUpdateUserRequestTicketRegimenBody } from '../request'

export type TicketRegimenUpdateUserDtoType = Pick<TicketUser, 'positionId' | 'userId'>

@Injectable()
export class TicketUpdateUserTicketRegimenOperation {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketUserCommon: TicketUserCommon,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateUserRequestTicketRegimen<T extends TicketRegimenUpdateUserDtoType>(obj: {
    oid: number
    ticketId: string
    ticketRegimenId: string
    body: TicketUpdateUserRequestTicketRegimenBody
  }) {
    const { oid, ticketId, ticketRegimenId, body } = obj
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
        positionType: PositionType.RegimenRequest,
        ticketItemId: ticketRegimenId,
      })

      const ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
        manager,
        createdAt: Date.now(),
        oid,
        ticketId,
        ticketUserDtoList: body.ticketUserRequestList.map((i) => {
          return {
            positionId: i.positionId,
            userId: i.userId,
            quantity: 1,
            ticketItemId: ticketRegimenId,
            positionInteractId: ticketRegimenOrigin.regimenId,
            ticketItemExpectedPrice: ticketRegimenOrigin.moneyAmountRegular,
            ticketItemActualPrice: ticketRegimenOrigin.moneyAmountSale,
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

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        ticketRegimen: { upsertedList: [ticketRegimenModified] },
        ticketUser: {
          upsertedList: ticketUserCreatedList,
          destroyedList: ticketUserDestroyedList,
        },
      })

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
