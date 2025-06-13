import { Injectable } from '@nestjs/common'
import { TicketLaboratoryStatus } from '../../../../_libs/database/common/variable'
import { TicketLaboratoryResult } from '../../../../_libs/database/entities'
import { TicketLaboratoryResultInsertType } from '../../../../_libs/database/entities/ticket-laboratory-result.entity'
import {
  TicketLaboratoryGroupRepository,
  TicketLaboratoryRepository,
  TicketLaboratoryResultRepository,
} from '../../../../_libs/database/repositories'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { ApiTicketLaboratoryGroupService } from './api-ticket-laboratory-group.service'
import { TicketLaboratoryGroupPostQuery, TicketLaboratoryGroupUpdateResultBody } from './request'

@Injectable()
export class ApiTicketLaboratoryGroupAction {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly ticketLaboratoryResultRepository: TicketLaboratoryResultRepository,
    private readonly apiTicketLaboratoryGroupService: ApiTicketLaboratoryGroupService
  ) { }

  async updateResult(options: {
    oid: number
    ticketLaboratoryGroupId: number
    body: TicketLaboratoryGroupUpdateResultBody
    query: TicketLaboratoryGroupPostQuery
  }) {
    const { oid, ticketLaboratoryGroupId, body } = options
    const response = options.query?.response

    const ticketLaboratoryGroupUpdate =
      await this.ticketLaboratoryGroupRepository.updateOneAndReturnEntity(
        { oid, id: ticketLaboratoryGroupId },
        { startedAt: body.startedAt, status: TicketLaboratoryStatus.Completed }
      )

    const { ticketId } = ticketLaboratoryGroupUpdate

    const ticketLaboratoryUpdateList = await this.ticketLaboratoryRepository.updateAndReturnEntity(
      { oid, ticketId, ticketLaboratoryGroupId },
      { startedAt: body.startedAt, status: TicketLaboratoryStatus.Completed }
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
          ticketLaboratoryGroupId,
          laboratoryGroupId: ticketLaboratoryGroupUpdate.laboratoryGroupId,
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

    this.socketEmitService.socketTicketLaboratoryListChange(oid, {
      ticketId,
      ticketLaboratoryGroupUpdate,
      ticketLaboratoryUpdateList,
      ticketLaboratoryResultInsertList: tlrInsertList,
      ticketLaboratoryResultUpdateList: tlrUpdateList,
    })

    ticketLaboratoryGroupUpdate.ticketLaboratoryList = ticketLaboratoryUpdateList

    await this.apiTicketLaboratoryGroupService.generateRelation([ticketLaboratoryGroupUpdate], {
      ticket: response?.ticketLaboratoryGroup?.ticket,
      customer: response?.ticketLaboratoryGroup?.customer,
      ticketUserList: response?.ticketLaboratoryGroup?.customer,
      ticketLaboratoryList: false,
      ticketLaboratoryResultMap: response?.ticketLaboratoryGroup?.ticketLaboratoryResultMap,
      imageList: response?.ticketLaboratoryGroup?.imageList,
    })

    return { data: { ticketLaboratoryGroup: ticketLaboratoryGroupUpdate } }
  }

  async cancelResult(options: { oid: number; ticketLaboratoryGroupId: number }) {
    const { oid, ticketLaboratoryGroupId } = options

    const ticketLaboratoryGroupUpdate =
      await this.ticketLaboratoryGroupRepository.updateOneAndReturnEntity(
        { oid, id: ticketLaboratoryGroupId },
        { status: TicketLaboratoryStatus.Pending }
      )

    const { ticketId } = ticketLaboratoryGroupUpdate

    const ticketLaboratoryUpdateList = await this.ticketLaboratoryRepository.updateAndReturnEntity(
      { oid, ticketId, ticketLaboratoryGroupId },
      { status: TicketLaboratoryStatus.Pending }
    )

    const ticketLaboratoryResultDestroyList =
      await this.ticketLaboratoryResultRepository.deleteAndReturnEntity({
        oid,
        ticketId,
        ticketLaboratoryGroupId,
      })

    this.socketEmitService.socketTicketLaboratoryListChange(oid, {
      ticketId,
      ticketLaboratoryGroupUpdate,
      ticketLaboratoryUpdateList,
      ticketLaboratoryResultDestroyList,
    })
    return { data: true }
  }
}
