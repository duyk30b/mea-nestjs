import { Injectable } from '@nestjs/common'
import { InteractType } from '../../../../../_libs/database/entities/commission.entity'
import {
  TicketClinicDestroyTicketUserOperation,
  TicketClinicUpdateInformationOperation,
  TicketClinicUpdateTicketUserOperation,
} from '../../../../../_libs/database/operations'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketClinicUpdateTicketUserBody } from './request'
import { TicketClinicUpdateTicketUserListBody } from './request/ticket-clinic-update-user-list.body'

@Injectable()
export class ApiTicketClinicUserService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketClinicDestroyTicketUserOperation: TicketClinicDestroyTicketUserOperation,
    private readonly ticketClinicUpdateTicketUserOperation: TicketClinicUpdateTicketUserOperation,
    private readonly ticketClinicUpdateInformationOperation: TicketClinicUpdateInformationOperation
  ) { }

  async destroyTicketUser(options: { oid: number; ticketId: number; ticketUserId: number }) {
    const { oid, ticketId, ticketUserId } = options
    const result = await this.ticketClinicDestroyTicketUserOperation.destroyTicketUser({
      oid,
      ticketId,
      ticketUserId,
    })

    const { ticket, ticketUserDestroy } = result

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })

    this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
      ticketId,
      ticketUserDestroyList: [ticketUserDestroy],
    })

    return { data: true }
  }

  async updateTicketUser(options: {
      oid: number
      ticketId: number
      ticketUserId: number
      body: TicketClinicUpdateTicketUserBody
    }) {
      const { oid, ticketId, ticketUserId, body } = options
      const result = await this.ticketClinicUpdateTicketUserOperation.updateTicketUser({
        oid,
        ticketId,
        ticketUserId,
        ticketUserUpdateDto: body,
      })
  
      this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket: result.ticket })
      this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
        ticketId,
        ticketUserUpdate: result.ticketUser,
      })
      return { data: true }
    }

  async updateTicketUserItem(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateTicketUserListBody
  }) {
    const { oid, ticketId, body } = options
    const { ticket, ticketUserChangeList } =
      await this.ticketClinicUpdateInformationOperation.startUpdate({
        oid,
        ticketId,
        ticketUser: {
          interactId: body.interactId,
          interactType: body.interactType,
          ticketItemId: body.ticketItemId,
          ticketItemActualPrice: 0,
          ticketItemExpectedPrice: 0,
          dataChange: body.ticketUserList,
        },
      })

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    if (ticketUserChangeList) {
      this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
        ticketId,
        ticketUserDestroyList: ticketUserChangeList.ticketUserDestroyList,
        ticketUserInsertList: ticketUserChangeList.ticketUserInsertList,
      })
    }
    return { data: { ticket } }
  }
}
