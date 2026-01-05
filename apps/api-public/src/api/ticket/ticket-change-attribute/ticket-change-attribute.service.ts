/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import Image, { ImageInteractType } from '../../../../../_libs/database/entities/image.entity'
import TicketAttribute, {
  TicketAttributeInsertType,
} from '../../../../../_libs/database/entities/ticket-attribute.entity'
import {
  TicketAttributeRepository,
  TicketRepository,
} from '../../../../../_libs/database/repositories'
import { ImageManagerService } from '../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketUpdateDiagnosisBody, TicketUpdateTicketAttributeListBody } from './request'

@Injectable()
export class TicketChangeAttributeService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketAttributeRepository: TicketAttributeRepository,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketRepository: TicketRepository
  ) { }

  async updateDiagnosis(options: {
    oid: number
    ticketId: string
    body: TicketUpdateDiagnosisBody
    files: FileUploadDto[]
  }) {
    const { oid, ticketId, body, files } = options
    const { imagesChange, ticketAttributeChangeList, ticketAttributeKeyList } = body

    let ticketModified = await this.ticketRepository.updateOne(
      { oid, id: ticketId },
      { note: body.note }
    )
    // 1. Update Ticket Image
    let imageCreatedList: Image[] = []
    let imageDestroyedList: Image[] = []
    let imageIdsNew = '[]'
    if (imagesChange) {
      const imageResponse = await this.imageManagerService.changeCloudinaryImageLink({
        oid,
        files,
        imageIdWaitList: imagesChange.imageIdWaitList,
        externalUrlList: imagesChange.externalUrlList,
        imageIdListOld: JSON.parse(ticketModified.imageDiagnosisIds || '[]'),
        imageInteract: {
          imageInteractType: ImageInteractType.Customer,
          imageInteractId: ticketModified.customerId,
          ticketId,
          ticketItemId: '0',
        },
      })
      imageCreatedList = imageResponse.imageCreatedList
      imageDestroyedList = imageResponse.imageDestroyedList
      imageIdsNew = JSON.stringify(imageResponse.imageIdListNew)

      if (ticketModified.imageDiagnosisIds !== imageIdsNew) {
        ticketModified = await this.ticketRepository.updateOne(
          { oid, id: ticketId },
          { imageDiagnosisIds: imageIdsNew }
        )
      }
    }

    // 2. Update Attribute
    let ticketAttributeDestroyedList: TicketAttribute[] = []
    let ticketAttributeCreatedList: TicketAttribute[] = []
    if (ticketAttributeChangeList) {
      ticketAttributeDestroyedList = await this.ticketAttributeRepository.deleteMany({
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

      ticketAttributeCreatedList =
        await this.ticketAttributeRepository.insertMany(ticketAttributeInsertList)
    }
    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified,
      ticketAttribute: {
        destroyedList: ticketAttributeDestroyedList,
        upsertedList: ticketAttributeCreatedList,
      },
    })
    return true
  }

  async updateTicketAttributeList(options: {
    oid: number
    ticketId: string
    body: TicketUpdateTicketAttributeListBody
  }) {
    const { oid, ticketId, body } = options
    const ticketAttributeKeyList = body.ticketAttributeList.map((i) => i.key)

    const ticketAttributeDestroyedList = await this.ticketAttributeRepository.deleteMany(
      {
        oid,
        ticketId,
        key: { IN: ticketAttributeKeyList },
      }
    )

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
    const ticketAttributeCreatedList =
      await this.ticketAttributeRepository.insertMany(ticketAttributeInsertList)

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketAttribute: {
        destroyedList: ticketAttributeDestroyedList,
        upsertedList: ticketAttributeCreatedList,
      },
    })

    return true
  }
}
