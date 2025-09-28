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
import {
  TicketUpdatePriorityTicketLaboratoryBody,
  TicketUpdateRequestTicketLaboratoryBody,
  TicketUpdateResultLaboratoryGroupBody,
  TicketUpsertRequestLaboratoryGroupBody,
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
    private readonly apiTicketLaboratoryGroupService: ApiTicketLaboratoryGroupService
  ) { }

  async upsertRequestLaboratoryGroup(options: {
    oid: number
    ticketId: string
    body: TicketUpsertRequestLaboratoryGroupBody
  }) {
    const { oid, ticketId, body } = options

    if (body.ticketLaboratoryGroupAddList.length) {
      const result = await this.ticketAddSelectLaboratoryOperation.addTicketLaboratoryGroupList({
        oid,
        ticketId,
        tlgDtoList: body.ticketLaboratoryGroupAddList,
      })

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified: result.ticketModified,
        ticketLaboratory: { upsertedList: result.ticketLaboratoryCreatedList },
        ticketLaboratoryGroup: { upsertedList: result.ticketLaboratoryGroupCreatedList },
      })
    }

    // if (body.ticketLaboratoryGroupUpdate) {
    //   const { ticketLaboratoryList: ticketLaboratoryListDto, ...ticketLaboratoryGroupDto } =
    //     body.ticketLaboratoryGroupUpdate
    //   const result = await this.ticketChangeSelectLaboratoryOperation.changeSelectLaboratoryList({
    //     oid,
    //     ticketId,
    //     ticketLaboratoryGroupDto,
    //     ticketLaboratoryListDto,
    //   })
    //   this.socketEmitService.socketTicketChangeOld(oid, { type: 'UPDATE', ticket: result.ticket })
    //   this.socketEmitService.socketTicketLaboratoryListChange(oid, {
    //     ticketId,
    //     ticketLaboratoryUpsertedList: result.ticketLaboratoryCreatedList,
    //     ticketLaboratoryDestroyedList: result.ticketLaboratoryDestroyedList,
    //     ticketLaboratoryGroupUpsertedList: [result.ticketLaboratoryGroupModified],
    //   })
    // }
    // return true
  }

  async destroyTicketLaboratory(options: {
    oid: number
    ticketId: string
    ticketLaboratoryId: string
  }) {
    const { oid, ticketId, ticketLaboratoryId } = options
    const result = await this.ticketDestroyTicketLaboratoryOperation.destroyTicketLaboratory({
      oid,
      ticketId,
      ticketLaboratoryId,
    })

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified: result.ticketModified,
      ticketLaboratory: { destroyedList: [result.ticketLaboratoryDestroyed] },
      ticketLaboratoryGroup: {
        destroyedList: result.ticketLaboratoryGroupDestroyed
          ? [result.ticketLaboratoryGroupDestroyed]
          : undefined,
        upsertedList: result.ticketLaboratoryGroupModified
          ? [result.ticketLaboratoryGroupModified]
          : undefined,
      },
    })

    return true
  }

  async destroyTicketLaboratoryGroup(options: {
    oid: number
    ticketId: string
    ticketLaboratoryGroupId: string
  }) {
    const { oid, ticketId, ticketLaboratoryGroupId } = options

    const ticketLaboratoryGroupOrigin = await this.ticketLaboratoryGroupRepository.findOneBy({
      oid,
      id: ticketLaboratoryGroupId,
    })

    if (ticketLaboratoryGroupOrigin.status === TicketLaboratoryStatus.Completed) {
      throw new BusinessError('Phiếu đã hoàn thành không thể xóa')
    }
    if (
      [PaymentMoneyStatus.PartialPaid, PaymentMoneyStatus.FullPaid].includes(
        ticketLaboratoryGroupOrigin.paymentMoneyStatus
      )
    ) {
      throw new BusinessError('Phiếu đã đóng tiền không thể xóa')
    }

    const result = await this.ticketDestroyTlgOperation.destroyTicketLaboratoryGroup({
      oid,
      ticketId,
      ticketLaboratoryGroupId,
    })

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified: result.ticketModified,
      ticketLaboratory: { destroyedList: result.ticketLaboratoryDestroyedList },
      ticketLaboratoryGroup: { destroyedList: [result.ticketLaboratoryGroupDestroyed] },
      ticketLaboratoryResult: { destroyedList: result.ticketLaboratoryResultDestroyedList },
    })

    return true
  }

  async updateRequestTicketLaboratory(options: {
    oid: number
    ticketId: string
    ticketLaboratoryId: string
    body: TicketUpdateRequestTicketLaboratoryBody
  }) {
    const { oid, ticketId, ticketLaboratoryId, body } = options
    const result = await this.ticketUpdateTicketLaboratoryOperation.updateTicketLaboratory({
      oid,
      ticketId,
      ticketLaboratoryId,
      ticketLaboratoryUpdateDto: body.ticketLaboratory,
      ticketUserRequestList: body.ticketUserRequestList,
    })

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified: result.ticketModified,
      ticketLaboratory: {
        upsertedList: [result.ticketLaboratoryModified],
      },
      ticketUser: {
        upsertedList: result.ticketUserCreatedList,
        destroyedList: result.ticketUserDestroyedList,
      },
    })

    return true
  }

  async updatePriorityTicketLaboratory(options: {
    oid: number
    ticketId: string
    body: TicketUpdatePriorityTicketLaboratoryBody
  }) {
    const { oid, ticketId, body } = options

    return true
  }

  async updateResult(options: {
    oid: number
    ticketId: string
    ticketLaboratoryGroupId: string
    body: TicketUpdateResultLaboratoryGroupBody
    query: TicketLaboratoryGroupPostQuery
  }) {
    const { oid, ticketId, ticketLaboratoryGroupId, body } = options
    const response = options.query?.response

    const ticketLaboratoryGroupUpdate =
      await this.ticketLaboratoryGroupRepository.updateOneAndReturnEntity(
        { oid, id: ticketLaboratoryGroupId },
        { completedAt: body.completedAt, status: TicketLaboratoryStatus.Completed }
      )

    const ticketLaboratoryModifiedList =
      await this.ticketLaboratoryRepository.updateAndReturnEntity(
        { oid, ticketId, ticketLaboratoryGroupId },
        { completedAt: body.completedAt, status: TicketLaboratoryStatus.Completed }
      )

    const tlrBodyInsertList = body.ticketLaboratoryResultUpdateList.filter((i) => {
      return !i.id
    })
    const tlrBodyUpdateList = body.ticketLaboratoryResultUpdateList.filter((i) => {
      return !!i.id
    })
    let tlrCreatedList: TicketLaboratoryResult[] = []
    let tlrModifiedList: TicketLaboratoryResult[] = []
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
      tlrCreatedList =
        await this.ticketLaboratoryResultRepository.insertManyAndReturnEntity(tlrDtoInsertList)
    }
    if (tlrBodyUpdateList.length) {
      tlrModifiedList = await this.ticketLaboratoryResultRepository.updateResultList({
        oid,
        ticketId,
        ticketLaboratoryResultDtoList: body.ticketLaboratoryResultUpdateList,
      })
    }

    ticketLaboratoryGroupUpdate.ticketLaboratoryList = ticketLaboratoryModifiedList

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketLaboratoryGroup: { upsertedList: [ticketLaboratoryGroupUpdate] },
      ticketLaboratory: { upsertedList: ticketLaboratoryModifiedList },
      ticketLaboratoryResult: {
        upsertedList: [...tlrCreatedList, ...tlrModifiedList],
      },
    })

    return { ticketLaboratoryGroup: ticketLaboratoryGroupUpdate }
  }

  async cancelResult(options: { oid: number; ticketId: string; ticketLaboratoryGroupId: string }) {
    const { oid, ticketId, ticketLaboratoryGroupId } = options

    const ticketLaboratoryGroupUpdate =
      await this.ticketLaboratoryGroupRepository.updateOneAndReturnEntity(
        { oid, id: ticketLaboratoryGroupId },
        { status: TicketLaboratoryStatus.Pending }
      )

    const ticketLaboratoryModifiedList =
      await this.ticketLaboratoryRepository.updateAndReturnEntity(
        { oid, ticketId, ticketLaboratoryGroupId },
        { status: TicketLaboratoryStatus.Pending }
      )

    const ticketLaboratoryResultDestroyedList =
      await this.ticketLaboratoryResultRepository.deleteAndReturnEntity({
        oid,
        ticketId,
        ticketLaboratoryGroupId,
      })

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketLaboratoryGroup: { upsertedList: [ticketLaboratoryGroupUpdate] },
      ticketLaboratory: { upsertedList: ticketLaboratoryModifiedList },
      ticketLaboratoryResult: {
        destroyedList: ticketLaboratoryResultDestroyedList,
      },
    })

    return true
  }
}
