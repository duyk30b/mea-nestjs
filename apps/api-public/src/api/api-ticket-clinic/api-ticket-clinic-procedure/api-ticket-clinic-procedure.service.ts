/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { InteractType } from '../../../../../_libs/database/entities/commission.entity'
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

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.ticketClinicChangeTicketProcedureList(oid, {
      ticketId,
      ticketProcedureInsert: ticketProcedure,
    })
    if (result.ticketUserInsertList) {
      this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
        ticketId,
        ticketUserInsertList: result.ticketUserInsertList,
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

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.ticketClinicChangeTicketProcedureList(oid, {
      ticketId,
      ticketProcedureDestroy: result.ticketProcedureDestroy,
    })
    if (result.ticketUserDestroyList) {
      this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
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
      ticketUserDto: body.ticketUserList,
    })

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket: result.ticket })
    this.socketEmitService.ticketClinicChangeTicketProcedureList(oid, {
      ticketId,
      ticketProcedureUpdate: result.ticketProcedure,
    })
    if (result.ticketUserChangeList) {
      this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
        ticketId,
        ticketUserDestroyList: result.ticketUserChangeList.ticketUserDestroyList,
        ticketUserInsertList: result.ticketUserChangeList.ticketUserInsertList,
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

    this.socketEmitService.ticketClinicChangeTicketProcedureList(oid, {
      ticketId,
      ticketProcedureList,
    })

    return { data: true }
  }
}
