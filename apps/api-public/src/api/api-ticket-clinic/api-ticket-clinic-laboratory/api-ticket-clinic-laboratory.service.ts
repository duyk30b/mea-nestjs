import { Injectable } from '@nestjs/common'
import { BusinessError } from '../../../../../_libs/database/common/error'
import {
  PaymentMoneyStatus,
  TicketLaboratoryStatus,
} from '../../../../../_libs/database/common/variable'
import { PositionInteractType } from '../../../../../_libs/database/entities/position.entity'
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

      this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: result.ticket })
      this.socketEmitService.socketTicketLaboratoryListChange(oid, {
        ticketId,
        ticketLaboratoryUpsertList: result.ticketLaboratoryInsertList,
        ticketLaboratoryGroupUpsertList: result.ticketLaboratoryGroupInsertList,
      })
    }

    if (body.ticketLaboratoryGroupUpdate) {
      const result =
        await this.ticketClinicChangeSelectLaboratoryOperation.changeSelectLaboratoryList({
          oid,
          ticketId,
          tlgDto: body.ticketLaboratoryGroupUpdate,
        })

      this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: result.ticket })
      this.socketEmitService.socketTicketLaboratoryListChange(oid, {
        ticketId,
        ticketLaboratoryUpsertList: result.ticketLaboratoryInsertList,
        ticketLaboratoryDestroyList: result.ticketLaboratoryDestroyList,
        ticketLaboratoryGroupUpsertList: [result.ticketLaboratoryGroupUpdate],
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

    return { data: true }
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

    const result = await this.ticketClinicDestroyTlgOperation.destroyTicketLaboratoryGroup({
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

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.socketTicketLaboratoryListChange(oid, {
      ticketId,
      ticketLaboratoryUpsertList: [ticketLaboratory],
    })
    if (body.ticketUserList) {
      this.apiTicketClinicUserService.changeTicketUserList({
        oid,
        ticketId,
        body: {
          positionType: PositionInteractType.Laboratory,
          positionInteractId: ticketLaboratory.laboratoryId,
          ticketItemId: ticketLaboratory.id,
          quantity: 1,
          ticketUserList: body.ticketUserList,
        },
      })
    }
    return { data: true }
  }

  async updatePriorityTicketLaboratory(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdatePriorityTicketLaboratoryBody
  }) {
    const { oid, ticketId, body } = options

    return { data: true }
  }
}
