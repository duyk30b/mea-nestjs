import { Injectable } from '@nestjs/common'
import { TicketLaboratoryStatus } from '../../../../../_libs/database/common/variable'
import { TicketLaboratoryResult } from '../../../../../_libs/database/entities'
import { InteractType } from '../../../../../_libs/database/entities/commission.entity'
import { TicketLaboratoryResultInsertType } from '../../../../../_libs/database/entities/ticket-laboratory-result.entity'
import {
  TicketClinicAddSelectLaboratoryOperation,
  TicketClinicChangeSelectLaboratoryOperation,
  TicketClinicDestroyTicketLaboratoryGroupOperation,
  TicketClinicDestroyTicketLaboratoryOperation,
  TicketClinicUpdateTicketLaboratoryOperation,
} from '../../../../../_libs/database/operations'
import {
  TicketLaboratoryGroupRepository,
  TicketLaboratoryRepository,
  TicketLaboratoryResultRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { ApiTicketClinicUserService } from '../api-ticket-clinic-user/api-ticket-clinic-user.service'
import {
  TicketClinicUpdatePriorityTicketLaboratoryBody,
  TicketClinicUpdateTicketLaboratoryBody,
  TicketClinicUpsertLaboratoryBody,
  TicketLaboratoryResultUpdateBody,
} from './request'

@Injectable()
export class ApiTicketClinicLaboratoryService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private readonly ticketLaboratoryResultRepository: TicketLaboratoryResultRepository,
    private readonly ticketClinicAddSelectLaboratoryOperation: TicketClinicAddSelectLaboratoryOperation,
    private readonly ticketClinicChangeSelectLaboratoryOperation: TicketClinicChangeSelectLaboratoryOperation,
    private readonly ticketClinicUpdateTicketLaboratoryOperation: TicketClinicUpdateTicketLaboratoryOperation,
    private readonly ticketClinicDestroyTicketLaboratoryOperation: TicketClinicDestroyTicketLaboratoryOperation,
    private readonly ticketClinicDestroyTlgOperation: TicketClinicDestroyTicketLaboratoryGroupOperation,
    private readonly apiTicketClinicUserService: ApiTicketClinicUserService
  ) { }

  async upsertLaboratory(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpsertLaboratoryBody
  }) {
    const { oid, ticketId, body } = options

    if (body.ticketLaboratoryGroupAddList.length) {
      const result = await this.ticketClinicAddSelectLaboratoryOperation.addSelectLaboratoryList({
        oid,
        ticketId,
        tlgDtoList: body.ticketLaboratoryGroupAddList,
      })

      this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket: result.ticket })
      this.socketEmitService.ticketClinicChangeLaboratory(oid, {
        ticketId,
        ticketLaboratoryInsertList: result.ticketLaboratoryInsertList,
        ticketLaboratoryGroupInsertList: result.ticketLaboratoryGroupInsertList,
      })
    }

    if (body.ticketLaboratoryGroupUpdate) {
      const result =
        await this.ticketClinicChangeSelectLaboratoryOperation.changeSelectLaboratoryList({
          oid,
          ticketId,
          tlgDto: body.ticketLaboratoryGroupUpdate,
        })

      this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket: result.ticket })
      this.socketEmitService.ticketClinicChangeLaboratory(oid, {
        ticketId,
        ticketLaboratoryInsertList: result.ticketLaboratoryInsertList,
        ticketLaboratoryDestroyList: result.ticketLaboratoryDestroyList,
        ticketLaboratoryGroupUpdate: result.ticketLaboratoryGroupUpdate,
      })
    }
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
    this.socketEmitService.ticketClinicChangeLaboratory(oid, {
      ticketId,
      ticketLaboratoryDestroyList: [result.ticketLaboratoryDestroy],
      ticketLaboratoryGroupDestroy: result.ticketLaboratoryGroupDestroy,
    })

    return { data: true }
  }

  async destroyTicketLaboratoryGroup(options: {
    oid: number
    ticketId: number
    ticketLaboratoryGroupId: number
  }) {
    const { oid, ticketId, ticketLaboratoryGroupId } = options
    const result = await this.ticketClinicDestroyTlgOperation.destroyTicketLaboratoryGroup({
      oid,
      ticketId,
      ticketLaboratoryGroupId,
    })

    const { ticket } = result

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.ticketClinicChangeLaboratory(oid, {
      ticketId,
      ticketLaboratoryGroupDestroy: result.ticketLaboratoryGroupDestroy,
      ticketLaboratoryDestroyList: result.ticketLaboratoryDestroyList,
      ticketLaboratoryResultDestroyList: result.ticketLaboratoryResultDestroyList,
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
    })
    const { ticket, ticketLaboratory } = result

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.ticketClinicChangeLaboratory(oid, {
      ticketId,
      ticketLaboratoryUpdateList: [ticketLaboratory],
    })
    if (body.ticketUserList) {
      this.apiTicketClinicUserService.changeTicketUserList({
        oid,
        ticketId,
        body: {
          interactType: InteractType.Laboratory,
          interactId: ticketLaboratory.laboratoryId,
          ticketItemId: ticketLaboratory.id,
          quantity: 1,
          ticketUserList: body.ticketUserList,
        },
      })
    }
    return { data: true }
  }

  async updateTicketLaboratoryResult(options: {
    oid: number
    ticketId: number
    body: TicketLaboratoryResultUpdateBody
  }) {
    const { oid, ticketId, body } = options

    const [ticketLaboratoryGroupUpdate] =
      await this.ticketLaboratoryGroupRepository.updateAndReturnEntity(
        { oid, ticketId, id: body.ticketLaboratoryGroupId },
        {
          startedAt: body.startedAt,
          status: TicketLaboratoryStatus.Completed,
        }
      )

    const ticketLaboratoryUpdateList = await this.ticketLaboratoryRepository.updateAndReturnEntity(
      {
        oid,
        ticketId,
        ticketLaboratoryGroupId: body.ticketLaboratoryGroupId,
      },
      {
        startedAt: body.startedAt,
        status: TicketLaboratoryStatus.Completed,
      }
    )

    const tlrBodyInsertList = body.ticketLaboratoryResultUpdateList.filter((i) => {
      return !i.id
    })
    const tlrBodyUpdateList = body.ticketLaboratoryResultUpdateList.filter((i) => {
      return !!i.id
    })
    let tlrInsertList: TicketLaboratoryResult[] = []
    let tlrUpdateList: TicketLaboratoryResult[] = []
    if (tlrBodyInsertList.length) {
      const tlrDtoInsertList = tlrBodyInsertList.map((i) => {
        const dtoInsert: TicketLaboratoryResultInsertType = {
          ...i,
          oid,
          ticketId,
          ticketLaboratoryGroupId: body.ticketLaboratoryGroupId,
          customerId: ticketLaboratoryGroupUpdate?.customerId || 0, // do ticketLaboratoryGroupUpdate cũ không tồn tại
        }
        return dtoInsert
      })
      tlrInsertList =
        await this.ticketLaboratoryResultRepository.insertManyAndReturnEntity(tlrDtoInsertList)
    }
    if (tlrBodyUpdateList.length) {
      tlrUpdateList = await this.ticketLaboratoryResultRepository.updateResultList({
        oid,
        ticketId,
        ticketLaboratoryResultDtoList: body.ticketLaboratoryResultUpdateList,
      })
    }

    this.socketEmitService.ticketClinicChangeLaboratory(oid, {
      ticketId,
      ticketLaboratoryGroupUpdate,
      ticketLaboratoryUpdateList,
      ticketLaboratoryResultInsertList: tlrInsertList,
      ticketLaboratoryResultUpdateList: tlrUpdateList,
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

    // this.socketEmitService.ticketClinicChangeLaboratory(oid, {
    //   ticketId,
    //   ticketLaboratoryList,
    // })

    return { data: true }
  }
}
