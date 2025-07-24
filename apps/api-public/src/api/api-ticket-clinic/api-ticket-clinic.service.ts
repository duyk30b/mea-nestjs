import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/array.helper'
import { TicketAttributeInsertType } from '../../../../_libs/database/entities/ticket-attribute.entity'
import { TicketStatus } from '../../../../_libs/database/entities/ticket.entity'
import {
  TicketAttributeRepository,
  TicketRepository,
} from '../../../../_libs/database/repositories'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { ImageManagerService } from '../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { TicketClinicUpdateDiagnosisBody } from './request/ticket-clinic-update-diagnosis.body'

@Injectable()
export class ApiTicketClinicService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private readonly imageRepository: ImageRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository
  ) { }

  async startCheckup(options: { oid: number; ticketId: number }) {
    const { oid, ticketId } = options
    const [ticket] = await this.ticketRepository.updateAndReturnEntity(
      {
        oid,
        id: ticketId,
        status: { IN: [TicketStatus.Schedule, TicketStatus.Draft, TicketStatus.Deposited] },
      },
      {
        status: TicketStatus.Executing,
        startedAt: Date.now(),
      }
    )
    if (!ticket) throw new BusinessException('error.Database.UpdateFailed')
    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    return { data: true }
  }

  async updateDiagnosis(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateDiagnosisBody
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
        const imageMap = arrayToKeyValue(imageList, 'id')
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
    return { data: true }
  }
}
