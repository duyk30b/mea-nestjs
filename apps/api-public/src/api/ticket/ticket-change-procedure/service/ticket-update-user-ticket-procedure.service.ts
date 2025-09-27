import { Injectable } from '@nestjs/common'
import { TicketRegimen, TicketUser } from '../../../../../../_libs/database/entities'
import { PositionType } from '../../../../../../_libs/database/entities/position.entity'
import TicketProcedure, {
  TicketProcedureType,
} from '../../../../../../_libs/database/entities/ticket-procedure.entity'
import Ticket, { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../../../../../../_libs/database/operations/ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../../../../../../_libs/database/operations/ticket-item/ticket-change-user/ticket-user.common'
import {
  TicketProcedureRepository,
  TicketRegimenRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { TicketUpdateUserTicketProcedureBody } from '../request'

export type TicketProcedureUpdateUserDtoType = Pick<TicketUser, 'positionId' | 'userId'>

@Injectable()
export class TicketUpdateUserTicketProcedureService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private ticketRepository: TicketRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketUserCommon: TicketUserCommon,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateUserTicketProcedure(params: {
    oid: number
    ticketId: string
    ticketProcedureId: string
    body: TicketUpdateUserTicketProcedureBody
  }) {
    const { oid, ticketId, ticketProcedureId, body } = params
    const PREFIX = `ticketId=${ticketId} updateUserTicketProcedure failed`

    const transaction = await this.ticketRepository.transaction(
      'READ UNCOMMITTED',
      async (manager) => {
        // === 1. UPDATE TICKET FOR TRANSACTION ===
        const ticketOrigin = await this.ticketRepository.managerUpdateOne(
          manager,
          { oid, id: ticketId, status: TicketStatus.Executing },
          { updatedAt: Date.now() }
        )

        // === 2. UPDATE TICKET PROCEDURE ===
        const ticketProcedureOrigin = await this.ticketProcedureRepository.managerFindOneBy(
          manager,
          {
            oid,
            ticketId,
            id: ticketProcedureId,
          }
        )

        const ticketUserDestroyedList = await this.ticketUserRepository.managerDelete(manager, {
          oid,
          ticketId,
          positionType: { IN: [PositionType.ProcedureRequest, PositionType.ProcedureResult] },
          ticketItemId: ticketProcedureId,
        })

        const ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
          manager,
          createdAt: Date.now(),
          oid,
          ticketId,
          ticketUserDtoList: [...body.ticketUserRequestList, ...body.ticketUserResultList].map(
            (i) => {
              return {
                positionId: i.positionId,
                userId: i.userId,
                quantity: 1,
                ticketItemId: ticketProcedureId,
                positionInteractId: ticketProcedureOrigin.procedureId,
                ticketItemExpectedPrice: ticketProcedureOrigin.expectedPrice,
                ticketItemActualPrice: ticketProcedureOrigin.actualPrice,
              }
            }
          ),
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
        let ticketRegimenModified: TicketRegimen

        // === 5. UPDATE TICKET: MONEY  ===
        if (commissionMoneyChange != 0) {
          ticketProcedureModified = await this.ticketProcedureRepository.managerUpdateOne(
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
        if (
          commissionMoneyChange != 0
          && ticketProcedureModified.ticketProcedureType === TicketProcedureType.InRegimen
        ) {
          ticketRegimenModified = await this.ticketRegimenRepository.managerUpdateOne(
            manager,
            { oid, ticketId, id: ticketProcedureModified.ticketRegimenId },
            { commissionAmount: () => `"commissionAmount" + ${commissionMoneyChange}` }
          )
        }
        return {
          ticketModified,
          ticketProcedureModified,
          ticketUserCreatedList,
          ticketUserDestroyedList,
          ticketRegimenModified,
        }
      }
    )

    const { ticketModified, ticketProcedureModified, ticketRegimenModified } = transaction

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified,
      ticketUser: {
        destroyedList: transaction.ticketUserDestroyedList || [],
        upsertedList: transaction.ticketUserCreatedList || [],
      },
      ticketProcedure: { upsertedList: [ticketProcedureModified] },
      ticketRegimen: { upsertedList: ticketRegimenModified ? [ticketRegimenModified] : [] },
    })

    return { ticketProcedureModified }
  }
}
