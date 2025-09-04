/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { TicketUser } from '../../../../../_libs/database/entities'
import Image, { ImageInteractType } from '../../../../../_libs/database/entities/image.entity'
import { PositionType } from '../../../../../_libs/database/entities/position.entity'
import { TicketRadiologyStatus } from '../../../../../_libs/database/entities/ticket-radiology.entity'
import {
  TicketAddTicketRadiologyListOperation,
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
  TicketAddTicketRadiologyListBody,
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
    private readonly ticketAddTicketRadiologyListOperation: TicketAddTicketRadiologyListOperation,
    private readonly ticketDestroyTicketRadiologyOperation: TicketDestroyTicketRadiologyOperation,
    private readonly ticketUpdateTicketRadiologyOperation: TicketUpdateTicketRadiologyOperation,
    private readonly apiTicketRadiologyService: ApiTicketRadiologyService,
    private readonly ticketChangeTicketUserOperation: TicketChangeTicketUserOperation
  ) { }

  async addTicketRadiologyList(options: {
    oid: number
    ticketId: number
    body: TicketAddTicketRadiologyListBody
  }) {
    const { oid, ticketId, body } = options
    const result = await this.ticketAddTicketRadiologyListOperation.addTicketRadiologyList({
      oid,
      ticketId,
      ticketRadiologyAddWrapList: body.ticketRadiologyWrapList.map((i) => {
        return {
          ticketRadiologyAdd: i.ticketRadiology,
          ticketUserRequestAddList: i.ticketUserRequestList,
        }
      }),
    })

    const { ticketModified, ticketRadiologyCreatedList, ticketUserCreatedList } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: ticketModified })
    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId,
      ticketRadiologyUpsertedList: ticketRadiologyCreatedList,
      ticketUserUpsertedList: ticketUserCreatedList,
    })

    ticketRadiologyCreatedList.forEach((tr) => {
      tr.ticketUserRequestList = ticketUserCreatedList.filter((tu) => {
        return tr.id === tu.ticketItemId
      })
    })
    return { ticketRadiologyCreatedList }
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

    const result = await this.ticketDestroyTicketRadiologyOperation.destroyTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyId,
    })

    const { ticket } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId,
      ticketRadiologyDestroyedList: [result.ticketRadiologyDestroyed],
      ticketUserDestroyedList: result.ticketUserDestroyedList || [],
    })

    return { ticketId, ticketRadiologyId }
  }

  async updateRequestTicketRadiology(options: {
    oid: number
    ticketId: number
    ticketRadiologyId: number
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

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: ticketModified })
    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId,
      ticketRadiologyUpsertedList: [ticketRadiologyModified],
      ticketUserUpsertedList: result.ticketUserCreatedList,
      ticketUserDestroyedList: result.ticketUserDestroyedList,
    })

    ticketRadiologyModified.ticketUserRequestList = result.ticketUserCreatedList || []
    return { ticketRadiologyModified }
  }

  async updatePriorityTicketRadiology(options: {
    oid: number
    ticketId: number
    body: TicketUpdatePriorityTicketRadiologyBody
  }) {
    const { oid, ticketId, body } = options
    const ticketRadiologyList = await this.ticketRadiologyManager.bulkUpdate({
      manager: this.ticketRadiologyRepository.getManager(),
      condition: { oid, ticketId },
      compare: ['id'],
      update: ['priority'],
      tempList: body.ticketRadiologyList,
      options: { requireEqualLength: true },
    })

    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId,
      ticketRadiologyUpsertedList: ticketRadiologyList,
    })

    return true
  }

  async updateResultTicketRadiology(options: {
    oid: number
    ticketRadiologyId: number
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
        imageIdsWait: body.imagesChange.imageIdsWait,
        externalUrlList: body.imagesChange.externalUrlList,
        imageIdsOld: JSON.parse(ticketRadiologyOrigin.imageIds),
        imageInteract: {
          imageInteractType: ImageInteractType.Customer,
          imageInteractId: customerId,
          ticketId,
          ticketItemId: ticketRadiologyId,
          ticketItemChildId: 0,
        },
      })
      imageIdsUpdateString = JSON.stringify(changeImageResponse.imageIdsNew)
      imageCreatedList = changeImageResponse.imageCreatedList
      imageDestroyedList = changeImageResponse.imageDestroyedList
    }

    const ticketRadiologyModified = await this.ticketRadiologyRepository.updateOneAndReturnEntity(
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
          ticketItemChildId: 0,
        },
      })
      ticketUserCreatedList = changeUserResult.ticketUserCreatedList
      ticketUserDestroyedList = changeUserResult.ticketUserDestroyedList
      this.socketEmitService.socketTicketChange(oid, {
        type: 'UPDATE',
        ticket: changeUserResult.ticketModified,
      })
    }

    await this.apiTicketRadiologyService.generateRelation({
      oid,
      ticketRadiologyList: [ticketRadiologyModified],
      relation: { imageList: true },
    })

    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId,
      ticketRadiologyUpsertedList: [ticketRadiologyModified],
      ticketUserUpsertedList: ticketUserCreatedList,
      ticketUserDestroyedList,
      imageUpsertedList: imageCreatedList,
      imageDestroyedList,
    })

    ticketRadiologyModified.ticketUserResultList = ticketUserCreatedList || []

    return { ticketRadiologyModified }
  }

  async cancelResultTicketRadiology(options: {
    oid: number
    ticketRadiologyId: number
    body: TicketCancelResultTicketRadiologyBody
  }) {
    const { oid, ticketRadiologyId, body } = options

    const ticketRadiologyOrigin = await this.ticketRadiologyRepository.findOneBy({
      oid,
      id: ticketRadiologyId,
    })

    const { ticketId } = ticketRadiologyOrigin

    const { imageDestroyedList } = await this.imageManagerService.removeImageList({
      oid,
      idRemoveList: JSON.parse(ticketRadiologyOrigin.imageIds),
    })

    const ticketRadiologyModified = await this.ticketRadiologyRepository.updateOneAndReturnEntity(
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

    const { ticketModified, ticketUserDestroyedList } =
      await this.ticketChangeTicketUserOperation.destroyTicketUserList({
        oid,
        ticketId,
        condition: {
          positionType: PositionType.RadiologyResult,
          ticketItemId: ticketRadiologyId,
          ticketItemChildId: 0,
        },
      })
    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: ticketModified })
    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId: ticketRadiologyOrigin.ticketId,
      ticketRadiologyUpsertedList: [ticketRadiologyModified],
      ticketUserDestroyedList,
      imageDestroyedList,
    })
    return { ticketRadiologyModified }
  }
}
