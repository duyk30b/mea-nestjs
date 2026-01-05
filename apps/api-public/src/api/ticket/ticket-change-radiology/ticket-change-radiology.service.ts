/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { Ticket, TicketUser } from '../../../../../_libs/database/entities'
import Image, { ImageInteractType } from '../../../../../_libs/database/entities/image.entity'
import { PositionType } from '../../../../../_libs/database/entities/position.entity'
import { TicketRadiologyStatus } from '../../../../../_libs/database/entities/ticket-radiology.entity'
import {
  TicketChangeTicketUserOperation,
  TicketDestroyTicketRadiologyOperation,
  TicketUpdateTicketRadiologyOperation,
} from '../../../../../_libs/database/operations'
import {
  TicketRadiologyManager,
  TicketRadiologyRepository,
} from '../../../../../_libs/database/repositories'
import { ImageManagerService } from '../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { ApiTicketRadiologyService } from '../../api-ticket-radiology/api-ticket-radiology.service'
import { TicketRadiologyPostQuery } from '../../api-ticket-radiology/request'
import {
  TicketCancelResultTicketRadiologyBody,
  TicketUpdatePriorityTicketRadiologyBody,
  TicketUpdateRequestTicketRadiologyBody,
  TicketUpdateResultTicketRadiologyBody,
} from './request'

@Injectable()
export class TicketChangeRadiologyService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly ticketRadiologyManager: TicketRadiologyManager,
    private readonly ticketDestroyTicketRadiologyOperation: TicketDestroyTicketRadiologyOperation,
    private readonly ticketUpdateTicketRadiologyOperation: TicketUpdateTicketRadiologyOperation,
    private readonly apiTicketRadiologyService: ApiTicketRadiologyService,
    private readonly ticketChangeTicketUserOperation: TicketChangeTicketUserOperation
  ) { }

  async destroyTicketRadiology(options: {
    oid: number
    ticketId: string
    ticketRadiologyId: string
  }) {
    const { oid, ticketId, ticketRadiologyId } = options
    const ticketRadiologyOrigin = await this.ticketRadiologyRepository.findOneBy({
      oid,
      id: ticketRadiologyId,
    })

    if (ticketRadiologyOrigin.status === TicketRadiologyStatus.Completed) {
      throw new BusinessError('Phiếu đã hoàn thành không thể xóa')
    }

    await this.imageManagerService.removeImageList({
      oid,
      idRemoveList: JSON.parse(ticketRadiologyOrigin.imageIds),
    })

    const result = await this.ticketDestroyTicketRadiologyOperation.destroyTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyId,
    })

    const { ticketModified } = result

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified,
      ticketRadiology: { destroyedList: [result.ticketRadiologyDestroyed] },
      ticketUser: { destroyedList: result.ticketUserDestroyedList || [] },
    })

    return { ticketId, ticketRadiologyId }
  }

  async updateRequestTicketRadiology(options: {
    oid: number
    ticketId: string
    ticketRadiologyId: string
    body: TicketUpdateRequestTicketRadiologyBody
  }) {
    const { oid, ticketId, ticketRadiologyId, body } = options
    const result = await this.ticketUpdateTicketRadiologyOperation.updateTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyId,
      ticketRadiologyUpdateDto: body.ticketRadiology,
      ticketUserRequestList: body.ticketUserRequestList,
    })
    const { ticketModified, ticketRadiologyModified } = result

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified,
      ticketRadiology: { upsertedList: [ticketRadiologyModified] },
      ticketUser: {
        destroyedList: result.ticketUserDestroyedList || [],
        upsertedList: result.ticketUserCreatedList || [],
      },
    })

    return { ticketRadiologyModified }
  }

  async updatePriorityTicketRadiology(options: {
    oid: number
    ticketId: string
    body: TicketUpdatePriorityTicketRadiologyBody
  }) {
    const { oid, ticketId, body } = options
    const ticketRadiologyList = await this.ticketRadiologyRepository.managerBulkUpdate({
      manager: this.ticketRadiologyRepository.getManager(),
      condition: { oid, ticketId },
      compare: { id: { cast: 'bigint' } },
      update: ['priority'],
      tempList: body.ticketRadiologyList,
      options: { requireEqualLength: true },
    })

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketRadiology: { upsertedList: ticketRadiologyList },
    })

    return true
  }

  async updateResultTicketRadiology(options: {
    oid: number
    ticketRadiologyId: string
    body: TicketUpdateResultTicketRadiologyBody
    query: TicketRadiologyPostQuery
    files: FileUploadDto[]
  }) {
    const { oid, ticketRadiologyId, body, files } = options

    const ticketRadiologyOrigin = await this.ticketRadiologyRepository.findOneBy({
      oid,
      id: ticketRadiologyId,
    })
    const { ticketId, customerId } = ticketRadiologyOrigin

    let imageIdsUpdateString = ticketRadiologyOrigin.imageIds
    let imageCreatedList: Image[] = []
    let imageDestroyedList: Image[] = []
    if (body.imagesChange) {
      const changeImageResponse = await this.imageManagerService.changeCloudinaryImageLink({
        oid,
        files,
        imageIdWaitList: body.imagesChange.imageIdWaitList,
        externalUrlList: body.imagesChange.externalUrlList,
        imageIdListOld: JSON.parse(ticketRadiologyOrigin.imageIds),
        imageInteract: {
          imageInteractType: ImageInteractType.Customer,
          imageInteractId: customerId,
          ticketId,
          ticketItemId: ticketRadiologyId,
        },
      })
      imageIdsUpdateString = JSON.stringify(changeImageResponse.imageIdListNew)
      imageCreatedList = changeImageResponse.imageCreatedList
      imageDestroyedList = changeImageResponse.imageDestroyedList
    }

    const ticketRadiologyModified = await this.ticketRadiologyRepository.updateOne(
      {
        oid,
        ticketId,
        id: ticketRadiologyId,
      },
      {
        printHtmlId: body.ticketRadiology.printHtmlId,
        description: body.ticketRadiology.description,
        customStyles: body.ticketRadiology.customStyles,
        customVariables: body.ticketRadiology.customVariables,
        result: body.ticketRadiology.result,
        completedAt: body.ticketRadiology.completedAt,
        imageIds: imageIdsUpdateString,
        status: TicketRadiologyStatus.Completed,
      }
    )

    let ticketUserCreatedList: TicketUser[] = []
    let ticketUserDestroyedList: TicketUser[] = []
    let ticketModified: Ticket
    if (body.ticketUserResultList?.length) {
      const changeUserResult = await this.ticketChangeTicketUserOperation.changeTicketUserList({
        oid,
        ticketId,
        createdAt: ticketRadiologyModified.completedAt,
        ticketUserDtoList: body.ticketUserResultList.map((i) => {
          return {
            ...i,
            ticketItemId: ticketRadiologyId,
            ticketItemChildId: 0,
            positionInteractId: ticketRadiologyModified.radiologyId,
            quantity: 1,
            ticketItemExpectedPrice: ticketRadiologyModified.expectedPrice,
            ticketItemActualPrice: ticketRadiologyModified.actualPrice,
          }
        }),
        destroy: {
          positionType: PositionType.RadiologyResult,
          ticketItemId: ticketRadiologyId,
        },
      })
      ticketUserCreatedList = changeUserResult.ticketUserCreatedList
      ticketUserDestroyedList = changeUserResult.ticketUserDestroyedList
      ticketModified = changeUserResult.ticketModified
    }

    await this.apiTicketRadiologyService.generateRelation({
      oid,
      ticketRadiologyList: [ticketRadiologyModified],
      relation: { imageList: true },
    })

    this.socketEmitService.socketTicketChange(oid, {
      ticketId: ticketRadiologyOrigin.ticketId,
      ticketModified: ticketModified || undefined,
      ticketRadiology: { upsertedList: [ticketRadiologyModified] },
      ticketUser: {
        upsertedList: ticketUserCreatedList,
        destroyedList: ticketUserDestroyedList,
      },
      imageList: {
        upsertedList: imageCreatedList,
        destroyedList: imageDestroyedList,
      },
    })

    return { ticketRadiologyModified }
  }

  async cancelResultTicketRadiology(options: {
    oid: number
    ticketRadiologyId: string
    body: TicketCancelResultTicketRadiologyBody
  }) {
    const { oid, ticketRadiologyId, body } = options

    const ticketRadiologyOrigin = await this.ticketRadiologyRepository.findOneBy({
      oid,
      id: ticketRadiologyId,
    })

    const { imageDestroyedList } = await this.imageManagerService.removeImageList({
      oid,
      idRemoveList: JSON.parse(ticketRadiologyOrigin.imageIds),
    })

    const ticketRadiologyModified = await this.ticketRadiologyRepository.updateOne(
      {
        oid,
        ticketId: ticketRadiologyOrigin.ticketId,
        id: ticketRadiologyId,
      },
      {
        printHtmlId: body.printHtmlId,
        description: body.description,
        result: body.result,
        customStyles: body.customStyles,
        customVariables: body.customVariables,
        completedAt: null,
        imageIds: JSON.stringify([]),
        status: TicketRadiologyStatus.Pending,
      }
    )
    ticketRadiologyModified.imageList = []

    this.socketEmitService.socketTicketChange(oid, {
      ticketId: ticketRadiologyOrigin.ticketId,
      ticketRadiology: { upsertedList: [ticketRadiologyModified] },
      imageList: { destroyedList: imageDestroyedList },
    })

    return { ticketRadiologyModified }
  }
}
