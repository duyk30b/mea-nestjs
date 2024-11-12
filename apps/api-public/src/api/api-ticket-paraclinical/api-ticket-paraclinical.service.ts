import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { Image } from '../../../../_libs/database/entities'
import { TicketParaclinicalStatus } from '../../../../_libs/database/entities/ticket-paraclinical.entity'
import { ImageRepository } from '../../../../_libs/database/repository/image/image.repository'
import { ParaclinicalRepository } from '../../../../_libs/database/repository/paraclinical/paraclinical.repository'
import { TicketParaclinicalRepository } from '../../../../_libs/database/repository/ticket-paraclinical/ticket-paraclinical.repository'
import { TicketRepository } from '../../../../_libs/database/repository/ticket/ticket-base/ticket.repository'
import { UserRepository } from '../../../../_libs/database/repository/user/user.repository'
import { ImageManagerService } from '../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { TicketParaclinicalGetOneQuery, TicketParaclinicalPaginationQuery } from './request'
import {
  TicketParaclinicalCreateBody,
  TicketParaclinicalUpdateBody,
} from './request/ticket-paraclinical-upsert.body'

@Injectable()
export class ApiTicketParaclinicalService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketParaclinicalRepository: TicketParaclinicalRepository,
    private readonly imageRepository: ImageRepository,
    private readonly paraclinicalRepository: ParaclinicalRepository,
    private readonly userRepository: UserRepository,
    private readonly ticketRepository: TicketRepository
  ) { }

  async pagination(oid: number, query: TicketParaclinicalPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { imageList, ...relationEntity } = relation // chưa xử lý imageList

    const { total, data } = await this.ticketParaclinicalRepository.pagination({
      relation: relationEntity,
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        paraclinicalId: filter?.paraclinicalId,
        ticketId: filter?.ticketId,
      },
      sort,
    })

    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getOne(
    oid: number,
    id: number,
    query: TicketParaclinicalGetOneQuery
  ): Promise<BaseResponse> {
    const { imageList, ...relationEntity } = query.relation
    const ticketParaclinical = await this.ticketParaclinicalRepository.findOne({
      relation: relationEntity,
      condition: { oid, id },
    })
    if (!ticketParaclinical) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (imageList) {
      ticketParaclinical.imageList = []
      const imageIds: number[] = JSON.parse(ticketParaclinical.imageIds)
      let imageMap: Record<string, Image> = {}
      if (imageIds.length > 0) {
        const imageList = await this.imageRepository.findManyByIds(imageIds)
        imageMap = arrayToKeyValue(imageList, 'id')
      }
      imageIds.forEach((i) => {
        ticketParaclinical.imageList.push(imageMap[i])
      })
    }

    return { data: { ticketParaclinical } }
  }

  async createCompleted(options: {
    oid: number
    body: Omit<TicketParaclinicalCreateBody, 'files' | 'file'>
    files: FileUploadDto[]
  }) {
    const { oid, body, files } = options

    const imageIdsUpdate = await this.imageManagerService.changeImage({
      oid,
      customerId: body.customerId,
      files,
      filesPosition: Array.from({ length: files.length }, (_, i) => i),
      imageIdsKeep: [],
      imageIdsOld: [],
    })

    const ticketParaclinical =
      await this.ticketParaclinicalRepository.insertOneFullFieldAndReturnEntity({
        ...body,
        oid,
        ticketId: body.ticketId,
        imageIds: JSON.stringify(imageIdsUpdate),
        status: TicketParaclinicalStatus.Completed,
        startedAt: body.startedAt,
      })

    if (!ticketParaclinical) throw new BusinessException('error.Database.InsertFailed')

    const [paraclinical, imageList] = await Promise.all([
      this.paraclinicalRepository.findOneById(ticketParaclinical.paraclinicalId),
      this.imageRepository.findMany({
        condition: {
          id: { IN: JSON.parse(ticketParaclinical.imageIds) },
        },
        sort: { id: 'ASC' },
      }),
    ])

    ticketParaclinical.paraclinical = paraclinical
    ticketParaclinical.imageList = imageList

    const [ticket] = await this.ticketRepository.refreshParaclinicalMoney({
      oid,
      ticketId: body.ticketId,
    })

    this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic: ticket })
    this.socketEmitService.ticketClinicUpdateTicketParaclinicalResult(oid, {
      ticketId: ticketParaclinical.ticketId,
      ticketParaclinical,
    })
    return { data: { ticketParaclinicalId: ticketParaclinical.id } }
  }

  async update(options: {
    oid: number
    ticketParaclinicalId: number
    body: Omit<TicketParaclinicalUpdateBody, 'files' | 'file'>
    files: FileUploadDto[]
  }) {
    const { oid, body, files, ticketParaclinicalId } = options
    const { imageIdsKeep, filesPosition, ...object } = body

    const oldTicketParaclinical = await this.ticketParaclinicalRepository.findOneBy({
      oid,
      id: ticketParaclinicalId,
    })

    const imageIdsUpdate = await this.imageManagerService.changeImage({
      oid,
      customerId: oldTicketParaclinical.customerId,
      files,
      filesPosition,
      imageIdsKeep,
      imageIdsOld: JSON.parse(oldTicketParaclinical.imageIds),
    })

    const [ticketParaclinical] = await this.ticketParaclinicalRepository.updateAndReturnEntity(
      { oid, id: ticketParaclinicalId },
      {
        imageIds: JSON.stringify(imageIdsUpdate),
        ...object,
      }
    )

    if (!ticketParaclinical) throw new BusinessException('error.Database.UpdateFailed')
    ticketParaclinical.imageList = []
    const imageIds: number[] = JSON.parse(ticketParaclinical.imageIds)

    const [paraclinical, imageList] = await Promise.all([
      this.paraclinicalRepository.findOneById(ticketParaclinical.paraclinicalId),
      this.imageRepository.findManyByIds(imageIds),
    ])

    const imageMap = arrayToKeyValue(imageList, 'id')
    imageIds.forEach((i) => {
      ticketParaclinical.imageList.push(imageMap[i])
    })

    ticketParaclinical.paraclinical = paraclinical

    const ticket = await this.ticketRepository.findOneBy({ oid, id: ticketParaclinical.ticketId })

    this.socketEmitService.ticketClinicUpdateTicketParaclinicalResult(oid, {
      ticketId: ticketParaclinical.ticketId,
      ticketParaclinical,
    })
    return { data: { ticketParaclinicalId: ticketParaclinical.id } }
  }
}
