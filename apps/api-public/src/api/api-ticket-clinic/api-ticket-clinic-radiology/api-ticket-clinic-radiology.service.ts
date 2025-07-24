/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { PositionInteractType } from '../../../../../_libs/database/entities/position.entity'
import { TicketRadiologyStatus } from '../../../../../_libs/database/entities/ticket-radiology.entity'
import {
  TicketClinicAddTicketRadiologyOperation,
  TicketClinicDestroyTicketRadiologyOperation,
  TicketClinicUpdateTicketRadiologyOperation,
} from '../../../../../_libs/database/operations'
import { TicketRadiologyRepository } from '../../../../../_libs/database/repositories'
import { ImageManagerService } from '../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { ApiTicketClinicUserService } from '../api-ticket-clinic-user/api-ticket-clinic-user.service'
import {
  TicketClinicAddTicketRadiologyBody,
  TicketClinicUpdateMoneyTicketRadiologyBody,
  TicketClinicUpdatePriorityTicketRadiologyBody,
} from './request'

@Injectable()
export class ApiTicketClinicRadiologyService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly ticketClinicAddTicketRadiologyOperation: TicketClinicAddTicketRadiologyOperation,
    private readonly ticketClinicDestroyTicketRadiologyOperation: TicketClinicDestroyTicketRadiologyOperation,
    private readonly ticketClinicUpdateTicketRadiologyOperation: TicketClinicUpdateTicketRadiologyOperation,
    private readonly apiTicketClinicUserService: ApiTicketClinicUserService
  ) { }

  async addTicketRadiology(options: {
    oid: number
    ticketId: number
    body: TicketClinicAddTicketRadiologyBody
  }) {
    const { oid, ticketId, body } = options
    const result = await this.ticketClinicAddTicketRadiologyOperation.addTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyInsertDto: {
        ...body,
        oid,
        ticketId,
        imageIds: JSON.stringify([]),
        startedAt: null,
        status: TicketRadiologyStatus.Pending,
      },
    })

    const { ticket, ticketRadiology } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId,
      ticketRadiologyUpsertList: [ticketRadiology],
    })
    return { data: true }
  }

  async destroyTicketRadiology(options: {
    oid: number
    ticketId: number
    ticketRadiologyId: number
  }) {
    const { oid, ticketId, ticketRadiologyId } = options
    const ticketRadiologyOrigin = await this.ticketRadiologyRepository.findOneBy({
      oid,
      id: ticketRadiologyId,
    })

    if (ticketRadiologyOrigin.status === TicketRadiologyStatus.Completed) {
      throw new BusinessError('Phiếu đã hoàn thành không thể xóa')
    }

    const imageIdsUpdate = await this.imageManagerService.removeImageList({
      oid,
      idRemoveList: JSON.parse(ticketRadiologyOrigin.imageIds),
    })

    const result = await this.ticketClinicDestroyTicketRadiologyOperation.destroyTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyId,
    })

    const { ticket } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId,
      ticketRadiologyDestroyList: [result.ticketRadiologyDestroy],
    })
    if (result.ticketUserDestroyList.length) {
      this.socketEmitService.socketTicketUserListChange(oid, {
        ticketId,
        ticketUserDestroyList: result.ticketUserDestroyList,
      })
    }

    return { data: true }
  }

  async updateMoneyTicketRadiology(options: {
    oid: number
    ticketId: number
    ticketRadiologyId: number
    body: TicketClinicUpdateMoneyTicketRadiologyBody
  }) {
    const { oid, ticketId, ticketRadiologyId, body } = options
    const result = await this.ticketClinicUpdateTicketRadiologyOperation.updateMoneyTicketRadiology(
      {
        oid,
        ticketId,
        ticketRadiologyId,
        ticketRadiologyUpdateDto: body.ticketRadiology,
      }
    )
    const { ticket, ticketRadiology } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: result.ticket })
    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId,
      ticketRadiologyUpsertList: [result.ticketRadiology],
    })
    if (body.ticketUserList?.length) {
      this.apiTicketClinicUserService.changeTicketUserList({
        oid,
        ticketId,
        body: {
          positionType: PositionInteractType.Radiology,
          positionInteractId: ticketRadiology.radiologyId,
          ticketItemId: ticketRadiology.id,
          quantity: 1,
          ticketUserList: body.ticketUserList,
        },
      })
    }
    return { data: true }
  }

  async updatePriorityTicketRadiology(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdatePriorityTicketRadiologyBody
  }) {
    const { oid, ticketId, body } = options
    const ticketRadiologyList = await this.ticketRadiologyRepository.updatePriorityList({
      oid,
      ticketId,
      updateData: body.ticketRadiologyList,
    })

    ticketRadiologyList.sort((a, b) => (a.priority < b.priority ? -1 : 1))

    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId,
      ticketRadiologyUpsertList: ticketRadiologyList,
    })

    return { data: true }
  }
}
