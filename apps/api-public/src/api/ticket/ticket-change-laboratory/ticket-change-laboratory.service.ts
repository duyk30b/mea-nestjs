import { Injectable } from '@nestjs/common'
import { ESArray } from '../../../../../_libs/common/helpers'
import { BusinessError } from '../../../../../_libs/database/common/error'
import {
  PaymentMoneyStatus,
  TicketLaboratoryStatus,
} from '../../../../../_libs/database/common/variable'
import { TicketLaboratoryResult } from '../../../../../_libs/database/entities'
import { TicketLaboratoryResultInsertType } from '../../../../../_libs/database/entities/ticket-laboratory-result.entity'
import {
  TicketDestroyTicketLaboratoryGroupOperation,
  TicketDestroyTicketLaboratoryOperation,
} from '../../../../../_libs/database/operations'
import {
  TicketLaboratoryGroupRepository,
  TicketLaboratoryRepository,
  TicketLaboratoryResultRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketLaboratoryGroupPostQuery } from '../../api-ticket-laboratory-group/request'
import {
  TicketUpdatePriorityTicketLaboratoryBody,
  TicketUpdateResultLaboratoryGroupBody,
} from './request'

@Injectable()
export class TicketChangeLaboratoryService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private readonly ticketLaboratoryResultRepository: TicketLaboratoryResultRepository,
    private readonly ticketDestroyTicketLaboratoryOperation: TicketDestroyTicketLaboratoryOperation,
    private readonly ticketDestroyTlgOperation: TicketDestroyTicketLaboratoryGroupOperation
  ) { }

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

    const ticketLaboratoryGroupUpdate = await this.ticketLaboratoryGroupRepository.updateOne(
      { oid, id: ticketLaboratoryGroupId },
      { completedAt: body.completedAt, status: TicketLaboratoryStatus.Completed }
    )

    const ticketLaboratoryModifiedList = await this.ticketLaboratoryRepository.updateMany(
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
      tlrCreatedList = await this.ticketLaboratoryResultRepository.insertMany(tlrDtoInsertList)
    }
    if (tlrBodyUpdateList.length) {
      tlrModifiedList = await this.ticketLaboratoryResultRepository.updateResultList({
        oid,
        ticketId,
        ticketLaboratoryResultDtoList: body.ticketLaboratoryResultUpdateList,
      })
    }

    ticketLaboratoryGroupUpdate.ticketLaboratoryList = ticketLaboratoryModifiedList
    ticketLaboratoryGroupUpdate.ticketLaboratoryResultMap = ESArray.arrayToKeyValue(
      [...tlrCreatedList, ...tlrModifiedList],
      'laboratoryId'
    )
    // chưa xử lý TicketUser
    ticketLaboratoryGroupUpdate.ticketUserRequestList = []
    ticketLaboratoryGroupUpdate.ticketUserResultList = []

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

    const ticketLaboratoryGroupUpdate = await this.ticketLaboratoryGroupRepository.updateOne(
      { oid, id: ticketLaboratoryGroupId },
      { status: TicketLaboratoryStatus.Pending }
    )

    const ticketLaboratoryModifiedList = await this.ticketLaboratoryRepository.updateMany(
      { oid, ticketId, ticketLaboratoryGroupId },
      { status: TicketLaboratoryStatus.Pending }
    )

    const ticketLaboratoryResultDestroyedList =
      await this.ticketLaboratoryResultRepository.deleteMany({
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
