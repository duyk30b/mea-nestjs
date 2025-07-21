/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { PositionInteractType } from '../../../../../_libs/database/entities/position.entity'
import {
  TicketClinicAddTicketProcedureOperation,
  TicketClinicDestroyTicketProcedureOperation,
  TicketClinicUpdateTicketProcedureOperation,
} from '../../../../../_libs/database/operations'
import { TicketProcedureRepository } from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { ApiTicketClinicUserService } from '../api-ticket-clinic-user/api-ticket-clinic-user.service'
import {
  TicketClinicAddTicketProcedureBody,
  TicketClinicUpdatePriorityTicketProcedureBody,
  TicketClinicUpdateTicketProcedureBody,
} from './request'

@Injectable()
export class ApiTicketClinicProcedureService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketProcedureRepository: TicketProcedureRepository,
    private readonly ticketClinicAddTicketProcedureOperation: TicketClinicAddTicketProcedureOperation,
    private readonly ticketClinicDestroyTicketProcedureOperation: TicketClinicDestroyTicketProcedureOperation,
    private readonly ticketClinicUpdateTicketProcedureOperation: TicketClinicUpdateTicketProcedureOperation,
    private readonly apiTicketClinicUserService: ApiTicketClinicUserService
  ) { }

  async addTicketProcedure(options: {
    oid: number
    ticketId: number
    body: TicketClinicAddTicketProcedureBody
  }) {
    const { oid, ticketId, body } = options
    const result = await this.ticketClinicAddTicketProcedureOperation.addTicketProcedure({
      oid,
      ticketId,
      ticketProcedureDto: body.ticketProcedure,
    })

    const { ticket, ticketProcedure } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      ticketProcedureUpsertList: [ticketProcedure],
    })
    if (body.ticketUserList?.length) {
      this.apiTicketClinicUserService.changeTicketUserList({
        oid,
        ticketId,
        body: {
          positionType: PositionInteractType.Procedure,
          positionInteractId: ticketProcedure.procedureId,
          ticketItemId: ticketProcedure.id,
          quantity: ticketProcedure.quantity,
          ticketUserList: body.ticketUserList,
        },
      })
    }

    return { data: true }
  }

  async destroyTicketProcedure(options: {
    oid: number
    ticketId: number
    ticketProcedureId: number
  }) {
    const { oid, ticketId, ticketProcedureId } = options
    const result = await this.ticketClinicDestroyTicketProcedureOperation.destroyTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
    })

    const { ticket } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      ticketProcedureDestroyList: [result.ticketProcedureDestroy],
    })
    if (result.ticketUserDestroyList) {
      this.socketEmitService.socketTicketUserListChange(oid, {
        ticketId,
        ticketUserDestroyList: result.ticketUserDestroyList,
      })
    }

    return { data: true }
  }

  async updateTicketProcedure(options: {
    oid: number
    ticketId: number
    ticketProcedureId: number
    body: TicketClinicUpdateTicketProcedureBody
  }) {
    const { oid, ticketId, ticketProcedureId, body } = options
    const result = await this.ticketClinicUpdateTicketProcedureOperation.updateTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
      ticketProcedureUpdateDto: body.ticketProcedure,
    })
    const { ticket, ticketProcedure } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      ticketProcedureUpsertList: [ticketProcedure],
    })
    if (body.ticketUserList) {
      this.apiTicketClinicUserService.changeTicketUserList({
        oid,
        ticketId,
        body: {
          positionType: PositionInteractType.Procedure,
          positionInteractId: ticketProcedure.procedureId,
          ticketItemId: ticketProcedure.id,
          quantity: ticketProcedure.quantity,
          ticketUserList: body.ticketUserList,
        },
      })
    }
    return { data: true }
  }

  async updatePriorityTicketProcedure(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdatePriorityTicketProcedureBody
  }) {
    const { oid, ticketId, body } = options
    const ticketProcedureList = await this.ticketProcedureRepository.updatePriorityList({
      oid,
      ticketId,
      updateData: body.ticketProcedureList,
    })
    ticketProcedureList.sort((a, b) => (a.priority < b.priority ? -1 : 1))

    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      ticketProcedureUpsertList: ticketProcedureList,
    })

    return { data: true }
  }
}
