/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import {
  TicketClinicAddTicketProcedureOperation,
  TicketClinicDestroyTicketProcedureOperation,
  TicketClinicUpdateTicketProcedureListOperation,
} from '../../../../../_libs/database/operations'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  TicketClinicAddTicketProcedure,
  TicketClinicUpdateTicketProcedureListBody,
} from './request'

@Injectable()
export class ApiTicketClinicProcedureService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketClinicAddTicketProcedureOperation: TicketClinicAddTicketProcedureOperation,
    private readonly ticketClinicDestroyTicketProcedureOperation: TicketClinicDestroyTicketProcedureOperation,
    private readonly ticketClinicUpdateTicketProcedureListOperation: TicketClinicUpdateTicketProcedureListOperation
  ) { }

  async addTicketProcedure(options: {
    oid: number
    ticketId: number
    body: TicketClinicAddTicketProcedure
  }) {
    const { oid, ticketId, body } = options
    const result = await this.ticketClinicAddTicketProcedureOperation.addTicketProcedure({
      oid,
      ticketId,
      ticketProcedureDto: body.ticketProcedure,
      ticketUserDto: body.ticketUserList,
    })

    const { ticket, ticketProcedure } = result

    this.socketEmitService.ticketClinicUpdate(oid, { ticket })
    this.socketEmitService.ticketClinicChangeTicketProcedureList(oid, {
      ticketId,
      ticketProcedureInsert: ticketProcedure,
    })

    return { data: { ticket, ticketProcedure } }
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

    this.socketEmitService.ticketClinicUpdate(oid, { ticket })
    this.socketEmitService.ticketClinicChangeTicketProcedureList(oid, {
      ticketId,
      ticketProcedureDestroy: result.ticketProcedureDestroy,
    })
    this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
      ticketId,
      ticketUserDestroyList: result.ticketUserDestroyList,
    })

    return { data: { ticket } }
  }

  async updateTicketProcedureList(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateTicketProcedureListBody
  }) {
    const { oid, ticketId, body } = options
    const result =
      await this.ticketClinicUpdateTicketProcedureListOperation.updateTicketProcedureList({
        oid,
        ticketId,
        ticketProcedureUpdateListDto: body.ticketProcedureList,
      })

    const { ticket, ticketProcedureList } = result

    this.socketEmitService.ticketClinicUpdate(oid, { ticket })
    this.socketEmitService.ticketClinicChangeTicketProcedureList(oid, {
      ticketId,
      ticketProcedureList,
    })

    return { data: true }
  }
}
