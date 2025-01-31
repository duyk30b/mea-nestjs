import { Injectable } from '@nestjs/common'
import {
  TicketClinicAddTicketLaboratoryOperation,
  TicketClinicDestroyTicketLaboratoryOperation,
  TicketClinicUpdateTicketLaboratoryOperation,
} from '../../../../../_libs/database/operations'
import { TicketLaboratoryRepository } from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  TicketClinicAddTicketLaboratoryListBody,
  TicketClinicUpdatePriorityTicketLaboratoryBody,
  TicketClinicUpdateTicketLaboratoryBody,
  TicketLaboratoryUpdateResultBody,
} from './request'

@Injectable()
export class ApiTicketClinicLaboratoryService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly ticketClinicAddTicketLaboratoryOperation: TicketClinicAddTicketLaboratoryOperation,
    private readonly ticketClinicUpdateTicketLaboratoryOperation: TicketClinicUpdateTicketLaboratoryOperation,
    private readonly ticketClinicDestroyTicketLaboratoryOperation: TicketClinicDestroyTicketLaboratoryOperation
  ) { }

  async addTicketLaboratoryList(options: {
    oid: number
    ticketId: number
    body: TicketClinicAddTicketLaboratoryListBody
  }) {
    const { oid, ticketId, body } = options
    const result = await this.ticketClinicAddTicketLaboratoryOperation.addTicketLaboratoryList({
      oid,
      ticketId,
      ticketLaboratoryDtoList: body.ticketLaboratoryList,
    })

    const { ticket, ticketLaboratoryList } = result

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.ticketClinicChangeTicketLaboratoryList(oid, {
      ticketId,
      ticketLaboratoryInsertList: ticketLaboratoryList,
    })

    return { data: true }
  }

  async destroyTicketLaboratory(options: {
    oid: number
    ticketId: number
    ticketLaboratoryId: number
  }) {
    const { oid, ticketId, ticketLaboratoryId } = options
    const result = await this.ticketClinicDestroyTicketLaboratoryOperation.destroyTicketLaboratory({
      oid,
      ticketId,
      ticketLaboratoryId,
    })

    const { ticket } = result

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.ticketClinicChangeTicketLaboratoryList(oid, {
      ticketId,
      ticketLaboratoryDestroy: result.ticketLaboratoryDestroy,
    })

    return { data: true }
  }

  async updateTicketLaboratory(options: {
    oid: number
    ticketId: number
    ticketLaboratoryId: number
    body: TicketClinicUpdateTicketLaboratoryBody
  }) {
    const { oid, ticketId, ticketLaboratoryId, body } = options
    const result = await this.ticketClinicUpdateTicketLaboratoryOperation.updateTicketLaboratory({
      oid,
      ticketId,
      ticketLaboratoryId,
      ticketLaboratoryUpdateDto: body.ticketLaboratory,
      ticketUserDto: body.ticketUserList,
    })

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket: result.ticket })
    this.socketEmitService.ticketClinicChangeTicketLaboratoryList(oid, {
      ticketId,
      ticketLaboratoryUpdate: result.ticketLaboratory,
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

  async updateResultTicketLaboratory(options: {
    oid: number
    ticketId: number
    body: TicketLaboratoryUpdateResultBody
  }) {
    const { oid, ticketId, body } = options

    if (!body.ticketLaboratoryUpdateList.length) {
      return { data: false }
    }
    const ticketLaboratoryUpdateList = await this.ticketLaboratoryRepository.updateResultList({
      oid,
      ticketId,
      startedAt: body.startedAt,
      ticketLaboratoryDtoList: body.ticketLaboratoryUpdateList,
    })

    this.socketEmitService.ticketClinicChangeTicketLaboratoryList(oid, {
      ticketId,
      ticketLaboratoryUpdateList,
    })
    return { data: true }
  }

  async updatePriorityTicketLaboratory(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdatePriorityTicketLaboratoryBody
  }) {
    const { oid, ticketId, body } = options
    // const ticketLaboratoryList = await this.ticketLaboratoryRepository.updatePriorityList({
    //   oid,
    //   ticketId,
    //   updateData: body.ticketLaboratoryList,
    // })
    // ticketLaboratoryList.sort((a, b) => (a.priority < b.priority ? -1 : 1))

    // this.socketEmitService.ticketClinicChangeTicketLaboratoryList(oid, {
    //   ticketId,
    //   ticketLaboratoryList,
    // })

    return { data: true }
  }
}
