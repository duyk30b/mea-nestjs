/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { TicketRadiologyStatus } from '../../../../../_libs/database/entities/ticket-radiology.entity'
import {
  TicketClinicAddTicketRadiologyOperation,
  TicketClinicDestroyTicketRadiologyOperation,
  TicketClinicUpdateTicketRadiologyOperation,
} from '../../../../../_libs/database/operations'
import {
  ImageRepository,
  TicketRadiologyRepository,
} from '../../../../../_libs/database/repositories'
import { ImageManagerService } from '../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  TicketClinicAddTicketRadiologyBody,
  TicketClinicUpdateMoneyTicketRadiologyBody,
  TicketClinicUpdatePriorityTicketRadiologyBody,
  TicketClinicUpdateResultTicketRadiologyBody,
} from './request'

@Injectable()
export class ApiTicketClinicRadiologyService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private readonly imageRepository: ImageRepository,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly ticketClinicAddTicketRadiologyOperation: TicketClinicAddTicketRadiologyOperation,
    private readonly ticketClinicDestroyTicketRadiologyOperation: TicketClinicDestroyTicketRadiologyOperation,
    private readonly ticketClinicUpdateTicketRadiologyOperation: TicketClinicUpdateTicketRadiologyOperation
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
        description: '',
        result: '',
        startedAt: null,
        status: TicketRadiologyStatus.Pending,
      },
    })

    const { ticket, ticketRadiology } = result

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.ticketClinicChangeTicketRadiologyList(oid, {
      ticketId,
      ticketRadiologyInsert: ticketRadiology,
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

    const imageIdsUpdate = await this.imageManagerService.changeImageList({
      oid,
      customerId: ticketRadiologyOrigin.customerId,
      files: [],
      filesPosition: [],
      imageIdsKeep: [],
      imageIdsOld: JSON.parse(ticketRadiologyOrigin.imageIds),
    })

    const result = await this.ticketClinicDestroyTicketRadiologyOperation.destroyTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyId,
    })

    const { ticket } = result

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.ticketClinicChangeTicketRadiologyList(oid, {
      ticketId,
      ticketRadiologyDestroy: result.ticketRadiologyDestroy,
    })
    if (result.ticketUserDestroyList.length) {
      this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
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
    const result = await this.ticketClinicUpdateTicketRadiologyOperation.updateTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyId,
      ticketRadiologyUpdateDto: body.ticketRadiology,
      ticketUserDto: body.ticketUserList,
    })

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket: result.ticket })
    this.socketEmitService.ticketClinicChangeTicketRadiologyList(oid, {
      ticketId,
      ticketRadiologyUpdate: result.ticketRadiology,
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

  async updateResultTicketRadiology(options: {
    oid: number
    ticketId: number
    ticketRadiologyId: number
    body: TicketClinicUpdateResultTicketRadiologyBody
    files: FileUploadDto[]
  }) {
    const { oid, ticketId, ticketRadiologyId, body, files } = options

    const ticketRadiologyOrigin = await this.ticketRadiologyRepository.findOneBy({
      oid,
      id: ticketRadiologyId,
    })

    const imageIdsUpdate = await this.imageManagerService.changeImageList({
      oid,
      customerId: ticketRadiologyOrigin.customerId,
      files,
      filesPosition: body.filesPosition,
      imageIdsKeep: body.imageIdsKeep,
      imageIdsOld: JSON.parse(ticketRadiologyOrigin.imageIds),
    })

    const result = await this.ticketClinicUpdateTicketRadiologyOperation.updateTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyId,
      ticketRadiologyUpdateDto: {
        description: body.ticketRadiology.description,
        result: body.ticketRadiology.result,
        startedAt: body.ticketRadiology.startedAt,
        imageIds: JSON.stringify(imageIdsUpdate),
      },
      ticketUserDto: body.ticketUserList,
    })

    const { ticket, ticketRadiology, ticketUserChangeList } = result
    ticketRadiology.imageList = []
    const imageIds: number[] = JSON.parse(ticketRadiology.imageIds)
    if (imageIds.length) {
      ticketRadiology.imageList = await this.imageRepository.findManyByIds(imageIds)
    }

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.ticketClinicChangeTicketRadiologyList(oid, {
      ticketId,
      ticketRadiologyUpdate: ticketRadiology,
    })
    if (ticketUserChangeList) {
      this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
        ticketId,
        ticketUserDestroyList: ticketUserChangeList.ticketUserDestroyList,
        ticketUserInsertList: ticketUserChangeList.ticketUserInsertList,
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

    this.socketEmitService.ticketClinicChangeTicketRadiologyList(oid, {
      ticketId,
      ticketRadiologyList,
    })

    return { data: true }
  }
}
