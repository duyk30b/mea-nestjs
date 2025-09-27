import { Injectable } from '@nestjs/common'
import { TicketChangeTicketUserOperation } from '../../../../../_libs/database/operations'
import { TicketUserRepository } from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketUpdateTicketUserCommissionBody } from './request'

@Injectable()
export class TicketChangeUserService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly ticketChangeTicketUserOperation: TicketChangeTicketUserOperation
  ) { }

  async destroyTicketUser(options: { oid: number; ticketId: string; ticketUserId: string }) {
    const { oid, ticketId, ticketUserId } = options
    const { ticketUserDestroyed, ticketModified } =
      await this.ticketChangeTicketUserOperation.destroyTicketUser({
        oid,
        ticketId,
        ticketUserId,
      })
    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified,
      ticketUser: { destroyedList: [ticketUserDestroyed] },
    })

    return { ticketUserDestroyedList: [ticketUserDestroyed] }
  }

  async updateTicketUserCommission(options: {
    oid: number
    ticketId: string
    ticketUserId: string
    body: TicketUpdateTicketUserCommissionBody
  }) {
    const { oid, ticketId, ticketUserId, body } = options
    const { ticketUserModified, ticketModified } =
      await this.ticketChangeTicketUserOperation.updateTicketUserCommission({
        oid,
        ticketId,
        ticketUserId,
        body: {
          commissionCalculatorType: body.commissionCalculatorType,
          commissionMoney: body.commissionMoney,
          commissionPercentActual: body.commissionPercentActual,
          commissionPercentExpected: body.commissionPercentExpected,
        },
      })
    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified,
      ticketUser: { upsertedList: [ticketUserModified] },
    })

    return { ticketUserModified }
  }
}
