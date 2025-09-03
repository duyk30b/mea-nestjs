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

  async destroyTicketUser(options: { oid: number; ticketId: number; ticketUserId: number }) {
    const { oid, ticketId, ticketUserId } = options
    const { ticketUserDestroyList, ticketModified } =
      await this.ticketChangeTicketUserOperation.destroyTicketUserList({
        oid,
        ticketId,
        condition: { id: { IN: [ticketUserId] } },
      })

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: ticketModified })
    this.socketEmitService.socketTicketUserListChange(oid, {
      ticketId,
      ticketUserDestroyList,
    })

    return { ticketUserDestroyList }
  }

  async updateTicketUserCommission(options: {
    oid: number
    ticketId: number
    ticketUserId: number
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
    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: ticketModified })
    this.socketEmitService.socketTicketUserListChange(oid, {
      ticketId,
      ticketUserUpsertList: [ticketUserModified],
    })
    return { ticketUserModified }
  }
}
