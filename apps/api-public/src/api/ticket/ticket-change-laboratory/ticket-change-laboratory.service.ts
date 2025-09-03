import { Injectable } from '@nestjs/common'
import { BusinessError } from '../../../../../_libs/database/common/error'
import {
  PaymentMoneyStatus,
  TicketLaboratoryStatus,
} from '../../../../../_libs/database/common/variable'
import { TicketLaboratoryResult } from '../../../../../_libs/database/entities'
import { TicketLaboratoryResultInsertType } from '../../../../../_libs/database/entities/ticket-laboratory-result.entity'
import {
  TicketAddSelectLaboratoryOperation,
  TicketChangeSelectLaboratoryOperation,
  TicketDestroyTicketLaboratoryGroupOperation,
  TicketDestroyTicketLaboratoryOperation,
  TicketUpdateTicketLaboratoryOperation,
} from '../../../../../_libs/database/operations'
import {
  TicketLaboratoryGroupRepository,
  TicketLaboratoryRepository,
  TicketLaboratoryResultRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { ApiTicketLaboratoryGroupService } from '../../api-ticket-laboratory-group/api-ticket-laboratory-group.service'
import { TicketLaboratoryGroupPostQuery } from '../../api-ticket-laboratory-group/request'
import { TicketChangeUserService } from '../ticket-change-user/ticket-change-user.service'
import {
  TicketUpdateLaboratoryGroupResultBody,
  TicketUpdatePriorityTicketLaboratoryBody,
  TicketUpdateTicketLaboratoryBody,
  TicketUpsertLaboratoryBody,
} from './request'

@Injectable()
export class TicketChangeLaboratoryService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private readonly ticketLaboratoryResultRepository: TicketLaboratoryResultRepository,
    private readonly ticketAddSelectLaboratoryOperation: TicketAddSelectLaboratoryOperation,
    private readonly ticketChangeSelectLaboratoryOperation: TicketChangeSelectLaboratoryOperation,
    private readonly ticketUpdateTicketLaboratoryOperation: TicketUpdateTicketLaboratoryOperation,
    private readonly ticketDestroyTicketLaboratoryOperation: TicketDestroyTicketLaboratoryOperation,
    private readonly ticketDestroyTlgOperation: TicketDestroyTicketLaboratoryGroupOperation,
    private readonly ticketChangeUserService: TicketChangeUserService,
    private readonly apiTicketLaboratoryGroupService: ApiTicketLaboratoryGroupService
  ) { }

  async upsertLaboratory(options: {
    oid: number
    ticketId: number
    body: TicketUpsertLaboratoryBody
  }) {
    const { oid, ticketId, body } = options

    if (body.ticketLaboratoryGroupAddList.length) {
      const result = await this.ticketAddSelectLaboratoryOperation.addSelectLaboratoryList({
        oid,
        ticketId,
        tlgDtoList: body.ticketLaboratoryGroupAddList,
      })

      this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: result.ticket })
      this.socketEmitService.socketTicketLaboratoryListChange(oid, {
        ticketId,
        ticketLaboratoryUpsertList: result.ticketLaboratoryInsertList,
        ticketLaboratoryGroupUpsertList: result.ticketLaboratoryGroupInsertList,
      })
    }

    if (body.ticketLaboratoryGroupUpdate) {
      const { ticketLaboratoryList: ticketLaboratoryListDto, ...ticketLaboratoryGroupDto } =
        body.ticketLaboratoryGroupUpdate
      const result = await this.ticketChangeSelectLaboratoryOperation.changeSelectLaboratoryList({
        oid,
        ticketId,
        ticketLaboratoryGroupDto,
        ticketLaboratoryListDto,
      })

      this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: result.ticket })
      this.socketEmitService.socketTicketLaboratoryListChange(oid, {
        ticketId,
        ticketLaboratoryUpsertList: result.ticketLaboratoryInsertList,
        ticketLaboratoryDestroyList: result.ticketLaboratoryDestroyList,
        ticketLaboratoryGroupUpsertList: [result.ticketLaboratoryGroupUpdate],
      })
    }
    return true
  }

  async destroyTicketLaboratory(options: {
    oid: number
    ticketId: number
    ticketLaboratoryId: number
  }) {
    const { oid, ticketId, ticketLaboratoryId } = options
    const result = await this.ticketDestroyTicketLaboratoryOperation.destroyTicketLaboratory({
      oid,
      ticketId,
      ticketLaboratoryId,
    })

    const { ticket } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.socketTicketLaboratoryListChange(oid, {
      ticketId,
      ticketLaboratoryDestroyList: [result.ticketLaboratoryDestroy],
      ticketLaboratoryGroupDestroyList: result.ticketLaboratoryGroupDestroy
        ? [result.ticketLaboratoryGroupDestroy]
        : undefined,
      ticketLaboratoryGroupUpsertList: result.ticketLaboratoryGroupModified
        ? [result.ticketLaboratoryGroupModified]
        : undefined,
    })

    return true
  }

  async destroyTicketLaboratoryGroup(options: {
    oid: number
    ticketId: number
    ticketLaboratoryGroupId: number
  }) {
    const { oid, ticketId, ticketLaboratoryGroupId } = options

    const ticketLaboratoryGroupOrigin = await this.ticketLaboratoryGroupRepository.findOneBy({
      oid,
      id: ticketLaboratoryGroupId,
    })

    if (ticketLaboratoryGroupOrigin.status === TicketLaboratoryStatus.Completed) {
      throw new BusinessError('Phiếu đã hoàn thành không thể xóa')
    }
    if (ticketLaboratoryGroupOrigin.paymentMoneyStatus === PaymentMoneyStatus.Paid) {
      throw new BusinessError('Phiếu đã đóng tiền không thể xóa')
    }

    const result = await this.ticketDestroyTlgOperation.destroyTicketLaboratoryGroup({
      oid,
      ticketId,
      ticketLaboratoryGroupId,
    })

    const { ticket } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.socketTicketLaboratoryListChange(oid, {
      ticketId,
      ticketLaboratoryGroupDestroyList: [result.ticketLaboratoryGroupDestroy],
      ticketLaboratoryDestroyList: result.ticketLaboratoryDestroyList,
      ticketLaboratoryResultDestroyList: result.ticketLaboratoryResultDestroyList,
    })

    return true
  }

  async updateTicketLaboratory(options: {
    oid: number
    ticketId: number
    ticketLaboratoryId: number
    body: TicketUpdateTicketLaboratoryBody
  }) {
    const { oid, ticketId, ticketLaboratoryId, body } = options
    const result = await this.ticketUpdateTicketLaboratoryOperation.updateTicketLaboratory({
      oid,
      ticketId,
      ticketLaboratoryId,
      ticketLaboratoryUpdateDto: body.ticketLaboratory,
      ticketUserRequestList: body.ticketUserRequestList,
    })
    const { ticketModified, ticketLaboratoryModified } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: ticketModified })
    this.socketEmitService.socketTicketLaboratoryListChange(oid, {
      ticketId,
      ticketLaboratoryUpsertList: [ticketLaboratoryModified],
    })
    this.socketEmitService.socketTicketUserListChange(oid, {
      ticketId,
      ticketUserUpsertList: result.ticketUserCreatedList,
      ticketUserDestroyList: result.ticketUserDestroyList,
    })
    return true
  }

  async updatePriorityTicketLaboratory(options: {
    oid: number
    ticketId: number
    body: TicketUpdatePriorityTicketLaboratoryBody
  }) {
    const { oid, ticketId, body } = options

    return true
  }

  async updateResult(options: {
    oid: number
    ticketId: number
    ticketLaboratoryGroupId: number
    body: TicketUpdateLaboratoryGroupResultBody
    query: TicketLaboratoryGroupPostQuery
  }) {
    const { oid, ticketId, ticketLaboratoryGroupId, body } = options
    const response = options.query?.response

    const ticketLaboratoryGroupUpdate =
      await this.ticketLaboratoryGroupRepository.updateOneAndReturnEntity(
        { oid, id: ticketLaboratoryGroupId },
        { completedAt: body.completedAt, status: TicketLaboratoryStatus.Completed }
      )

    const ticketLaboratoryUpdateList = await this.ticketLaboratoryRepository.updateAndReturnEntity(
      { oid, ticketId, ticketLaboratoryGroupId },
      { completedAt: body.completedAt, status: TicketLaboratoryStatus.Completed }
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
      ticketLaboratoryGroupUpsertList: [ticketLaboratoryGroupUpdate],
      ticketLaboratoryUpsertList: ticketLaboratoryUpdateList,
      ticketLaboratoryResultUpsertList: [...tlrInsertList, ...tlrUpdateList],
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

    return { ticketLaboratoryGroup: ticketLaboratoryGroupUpdate }
  }

  async cancelResult(options: { oid: number; ticketId: number; ticketLaboratoryGroupId: number }) {
    const { oid, ticketId, ticketLaboratoryGroupId } = options

    const ticketLaboratoryGroupUpdate =
      await this.ticketLaboratoryGroupRepository.updateOneAndReturnEntity(
        { oid, id: ticketLaboratoryGroupId },
        { status: TicketLaboratoryStatus.Pending }
      )

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
      ticketLaboratoryGroupUpsertList: [ticketLaboratoryGroupUpdate],
      ticketLaboratoryUpsertList: ticketLaboratoryUpdateList,
      ticketLaboratoryResultDestroyList,
    })
    return true
  }
}
