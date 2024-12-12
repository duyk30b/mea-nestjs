import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { Image } from '../../../../_libs/database/entities'
import { TicketRadiologyStatus } from '../../../../_libs/database/entities/ticket-radiology.entity'
import { TicketRepository } from '../../../../_libs/database/repositories'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { RadiologyRepository } from '../../../../_libs/database/repositories/radiology.repository'
import { TicketRadiologyRepository } from '../../../../_libs/database/repositories/ticket-radiology.repository'
import { UserRepository } from '../../../../_libs/database/repositories/user.repository'
import { ImageManagerService } from '../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  TicketRadiologyCreateBody,
  TicketRadiologyGetOneQuery,
  TicketRadiologyPaginationQuery,
  TicketRadiologyUpdateBody,
} from './request'

@Injectable()
export class ApiTicketRadiologyService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly imageRepository: ImageRepository,
    private readonly radiologyRepository: RadiologyRepository,
    private readonly userRepository: UserRepository,
    private readonly ticketRepository: TicketRepository
  ) { }

  async pagination(oid: number, query: TicketRadiologyPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { imageList, ...relationEntity } = relation // chưa xử lý imageList

    const { total, data } = await this.ticketRadiologyRepository.pagination({
      relation: relationEntity,
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        radiologyId: filter?.radiologyId,
        ticketId: filter?.ticketId,
      },
      sort,
    })

    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getOne(oid: number, id: number, query: TicketRadiologyGetOneQuery): Promise<BaseResponse> {
    const { imageList, ...relationEntity } = query.relation
    const ticketRadiology = await this.ticketRadiologyRepository.findOne({
      relation: relationEntity,
      condition: { oid, id },
    })
    if (!ticketRadiology) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (imageList) {
      ticketRadiology.imageList = []
      const imageIds: number[] = JSON.parse(ticketRadiology.imageIds)
      let imageMap: Record<string, Image> = {}
      if (imageIds.length > 0) {
        const imageList = await this.imageRepository.findManyByIds(imageIds)
        imageMap = arrayToKeyValue(imageList, 'id')
      }
      imageIds.forEach((i) => {
        ticketRadiology.imageList.push(imageMap[i])
      })
    }

    return { data: { ticketRadiology } }
  }

  async createCompleted(options: {
    oid: number
    body: Omit<TicketRadiologyCreateBody, 'files' | 'file'>
    files: FileUploadDto[]
  }) {
    const { oid, body, files } = options

    const imageIdsUpdate = await this.imageManagerService.changeImageList({
      oid,
      customerId: body.customerId,
      files,
      filesPosition: Array.from({ length: files.length }, (_, i) => i),
      imageIdsKeep: [],
      imageIdsOld: [],
    })

    const ticketRadiology = await this.ticketRadiologyRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      oid,
      ticketId: body.ticketId,
      imageIds: JSON.stringify(imageIdsUpdate),
      status: TicketRadiologyStatus.Completed,
      startedAt: body.startedAt,
    })

    if (!ticketRadiology) throw new BusinessException('error.Database.InsertFailed')

    const [radiology, imageList] = await Promise.all([
      this.radiologyRepository.findOneById(ticketRadiology.radiologyId),
      this.imageRepository.findMany({
        condition: {
          id: { IN: JSON.parse(ticketRadiology.imageIds) },
        },
        sort: { id: 'ASC' },
      }),
    ])

    ticketRadiology.radiology = radiology
    ticketRadiology.imageList = imageList

    const [ticket] = await this.ticketRepository.refreshRadiologyMoney({
      oid,
      ticketId: body.ticketId,
    })

    this.socketEmitService.ticketClinicUpdate(oid, { ticket })
    this.socketEmitService.ticketClinicUpdateTicketRadiologyResult(oid, {
      ticketId: ticketRadiology.ticketId,
      ticketRadiology,
    })
    return { data: { ticketRadiologyId: ticketRadiology.id } }
  }

  async updateResult(options: {
    oid: number
    ticketRadiologyId: number
    body: Omit<TicketRadiologyUpdateBody, 'files' | 'file'>
    files: FileUploadDto[]
  }) {
    const { oid, body, files, ticketRadiologyId } = options
    const { imageIdsKeep, filesPosition, ...object } = body

    const oldTicketRadiology = await this.ticketRadiologyRepository.findOneBy({
      oid,
      id: ticketRadiologyId,
    })

    const imageIdsUpdate = await this.imageManagerService.changeImageList({
      oid,
      customerId: oldTicketRadiology.customerId,
      files,
      filesPosition,
      imageIdsKeep,
      imageIdsOld: JSON.parse(oldTicketRadiology.imageIds),
    })

    const [ticketRadiology] = await this.ticketRadiologyRepository.updateAndReturnEntity(
      { oid, id: ticketRadiologyId },
      {
        ...object,
        imageIds: JSON.stringify(imageIdsUpdate),
        status: TicketRadiologyStatus.Completed,
      }
    )

    if (!ticketRadiology) throw new BusinessException('error.Database.UpdateFailed')
    ticketRadiology.imageList = []
    const imageIds: number[] = JSON.parse(ticketRadiology.imageIds)

    const [radiology, imageList] = await Promise.all([
      this.radiologyRepository.findOneById(ticketRadiology.radiologyId),
      this.imageRepository.findManyByIds(imageIds),
    ])

    const imageMap = arrayToKeyValue(imageList, 'id')
    imageIds.forEach((i) => {
      ticketRadiology.imageList.push(imageMap[i])
    })

    ticketRadiology.radiology = radiology

    this.socketEmitService.ticketClinicUpdateTicketRadiologyResult(oid, {
      ticketId: ticketRadiology.ticketId,
      ticketRadiology,
    })
    return { data: { ticketRadiologyId: ticketRadiology.id } }
  }

  async cancelResult(oid: number, id: number) {
    const ticketRadiologyOrigin = await this.ticketRadiologyRepository.findOneBy({
      oid,
      id,
    })

    const imageIdsUpdate = await this.imageManagerService.changeImageList({
      oid,
      customerId: ticketRadiologyOrigin.customerId,
      files: [],
      filesPosition: [],
      imageIdsKeep: [],
      imageIdsOld: JSON.parse(ticketRadiologyOrigin.imageIds),
    })

    const [ticketRadiology] = await this.ticketRadiologyRepository.updateAndReturnEntity(
      { oid, id },
      {
        startedAt: null,
        status: TicketRadiologyStatus.Pending,
        result: '',
        description: '',
        imageIds: JSON.stringify(imageIdsUpdate),
      }
    )
    ticketRadiology.imageList = []
    this.socketEmitService.ticketClinicUpdateTicketRadiologyResult(oid, {
      ticketId: ticketRadiology.ticketId,
      ticketRadiology,
    })
    return { data: { ticketId: ticketRadiology.ticketId } }
  }
}
