/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { ESArray } from '../../../../../_libs/common/helpers'
import { TicketAttributeInsertType } from '../../../../../_libs/database/entities/ticket-attribute.entity'
import { ImageRepository, TicketAttributeRepository, TicketRepository } from '../../../../../_libs/database/repositories'
import { ImageManagerService } from '../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketUpdateDiagnosisBody, TicketUpdateTicketAttributeListBody } from './request'

@Injectable()
export class TicketChangeAttributeService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketAttributeRepository: TicketAttributeRepository,
    private readonly imageManagerService: ImageManagerService,
    private readonly imageRepository: ImageRepository,
    private readonly ticketRepository: TicketRepository
  ) { }

  async updateDiagnosis(options: {
    oid: number
    ticketId: number
    body: TicketUpdateDiagnosisBody
    files: FileUploadDto[]
  }) {
    const { oid, ticketId, body, files } = options
    const { imagesChange, ticketAttributeChangeList, ticketAttributeKeyList } = body

    let ticket = await this.ticketRepository.updateOneAndReturnEntity(
      { oid, id: ticketId },
      { note: body.note }
    )
    // 1. Update Ticket Image
    if (imagesChange) {
      const imageIdsUpdate = await this.imageManagerService.changeCloudinaryImageLink({
        oid,
        customerId: ticket.customerId,
        files,
        imageIdsWait: imagesChange.imageIdsWait,
        externalUrlList: imagesChange.externalUrlList,
        imageIdsOld: JSON.parse(ticket.imageIds || '[]'),
      })
      if (ticket.imageIds !== JSON.stringify(imageIdsUpdate)) {
        const ticketUpdateList = await this.ticketRepository.updateAndReturnEntity(
          { oid, id: ticketId },
          { imageIds: JSON.stringify(imageIdsUpdate) }
        )
        ticket = ticketUpdateList[0]
        ticket.imageList = []
        const imageIds: number[] = JSON.parse(ticket.imageIds)
        const imageList = await this.imageRepository.findManyByIds(imageIds)
        const imageMap = ESArray.arrayToKeyValue(imageList, 'id')
        imageIds.forEach((i) => {
          ticket.imageList.push(imageMap[i])
        })
      }
    }

    // 2. Update Attribute
    if (ticketAttributeChangeList) {
      await this.ticketAttributeRepository.delete({
        oid,
        ticketId,
        key: { IN: ticketAttributeKeyList },
      })
      const ticketAttributeInsertList = ticketAttributeChangeList.map((i) => {
        const dto: TicketAttributeInsertType = {
          ...i,
          oid,
          ticketId,
        }
        return dto
      })

      await this.ticketAttributeRepository.insertMany(ticketAttributeInsertList)

      const ticketAttributeList = await this.ticketAttributeRepository.findManyBy({
        oid,
        ticketId,
      })

      this.socketEmitService.socketTicketAttributeListChange(oid, {
        ticketId,
        ticketAttributeList,
      })
    }
    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    return true
  }

  async updateTicketAttributeList(options: {
    oid: number
    ticketId: number
    body: TicketUpdateTicketAttributeListBody
  }) {
    const { oid, ticketId, body } = options
    const ticketAttributeKeyList = body.ticketAttributeList.map((i) => i.key)

    await this.ticketAttributeRepository.delete({
      oid,
      ticketId,
      key: { IN: ticketAttributeKeyList },
    })

    const ticketAttributeInsertList = body.ticketAttributeList
      .filter((i) => !!i.value)
      .map((i) => {
        const dto: TicketAttributeInsertType = {
          oid,
          ticketId,
          key: i.key,
          value: i.value,
        }
        return dto
      })
    const ticketAttributeList =
      await this.ticketAttributeRepository.insertManyAndReturnEntity(ticketAttributeInsertList)

    this.socketEmitService.socketTicketAttributeListChange(oid, {
      ticketId,
      ticketAttributeList,
    })

    return true
  }
}
