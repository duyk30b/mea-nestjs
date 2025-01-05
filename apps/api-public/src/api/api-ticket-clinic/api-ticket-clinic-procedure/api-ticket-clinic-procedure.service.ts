/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import {
  TicketClinicAddTicketProcedureOperation,
  TicketClinicDestroyTicketProcedureOperation,
  TicketClinicUpdateTicketProcedureOperation,
} from '../../../../../_libs/database/operations'
import { TicketProcedureRepository } from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
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
    private readonly ticketClinicUpdateTicketProcedureOperation: TicketClinicUpdateTicketProcedureOperation
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
      ticketUserDto: body.ticketUserList.filter((i) => !!i.userId),
    })

    const { ticket, ticketProcedure } = result

    this.socketEmitService.ticketClinicUpdate(oid, { ticket })
    this.socketEmitService.ticketClinicChangeTicketProcedureList(oid, {
      ticketId,
      ticketProcedureInsert: ticketProcedure,
    })
    this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
      ticketId,
      ticketUserInsertList: result.ticketUserInsertList,
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

  async updateTicketProcedure(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateTicketProcedureBody
  }) {
    const { oid, ticketId, body } = options
    const result = await this.ticketClinicUpdateTicketProcedureOperation.updateTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId: body.ticketProcedureId,
      ticketProcedureUpdateDto: body.ticketProcedure,
      ticketUserDto: body.ticketUserList?.filter((i) => !!i.userId),
    })

    this.socketEmitService.ticketClinicUpdate(oid, { ticket: result.ticket })
    this.socketEmitService.ticketClinicChangeTicketProcedureList(oid, {
      ticketId,
      ticketProcedureUpdate: result.ticketProcedure,
    })
    this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
      ticketId,
      ticketUserDestroyList: result.ticketUserDestroyList,
      ticketUserInsertList: result.ticketUserInsertList,
    })

    return { data: true }
  }

  async updatePriorityTicketProcedure(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdatePriorityTicketProcedureBody
  }) {
    const { oid, ticketId, body } = options
    const result = await this.ticketProcedureRepository.updatePriorityList({
      oid,
      ticketId,
      updateData: body.ticketProcedureList,
    })

    const ticketProcedureList = await this.ticketProcedureRepository.findMany({
      condition: { oid, ticketId },
      sort: { priority: 'ASC' },
    })

    this.socketEmitService.ticketClinicChangeTicketProcedureList(oid, {
      ticketId,
      ticketProcedureList,
    })

    return { data: true }
  }
}
