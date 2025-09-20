/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { ESArray } from '../../../../../_libs/common/helpers'
import {
  PaymentMoneyStatus,
  TicketRegimenStatus,
} from '../../../../../_libs/database/common/variable'
import { TicketRegimen } from '../../../../../_libs/database/entities'
import Image, { ImageInteractType } from '../../../../../_libs/database/entities/image.entity'
import { PositionType } from '../../../../../_libs/database/entities/position.entity'
import {
  TicketProcedureStatus,
  TicketProcedureType,
} from '../../../../../_libs/database/entities/ticket-procedure.entity'
import {
  TicketAddTicketProcedureListOperation,
  TicketChangeItemMoneyManager,
  TicketDestroyTicketProcedureOperation,
  TicketDestroyTicketRegimenOperation,
  TicketUpdateMoneyTicketProcedureOperation,
  TicketUpdateMoneyTicketRegimenOperation,
  TicketUpdateUserTicketProcedureOperation,
  TicketUpdateUserTicketRegimenOperation,
} from '../../../../../_libs/database/operations'
import {
  ImageRepository,
  TicketProcedureRepository,
  TicketRegimenRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../../_libs/database/repositories'
import { ImageManagerService } from '../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  TicketAddTicketProcedureListBody,
  TicketProcedureUpdateResultBody,
  TicketUpdateMoneyTicketProcedureBody,
  TicketUpdateMoneyTicketRegimenBody,
  TicketUpdatePriorityTicketProcedureBody,
  TicketUpdateUserRequestTicketProcedureBody,
  TicketUpdateUserRequestTicketRegimenBody,
  TicketUpdateUserResultTicketProcedureBody,
} from './request'

@Injectable()
export class TicketChangeProcedureService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketProcedureRepository: TicketProcedureRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly ticketRegimenRepository: TicketRegimenRepository,
    private readonly imageRepository: ImageRepository,
    private readonly ticketAddTicketProcedureListOperation: TicketAddTicketProcedureListOperation,
    private readonly ticketDestroyTicketProcedureOperation: TicketDestroyTicketProcedureOperation,
    private readonly ticketDestroyTicketRegimenOperation: TicketDestroyTicketRegimenOperation,
    private readonly ticketUpdateUserTicketProcedureOperation: TicketUpdateUserTicketProcedureOperation,
    private readonly ticketUpdateMoneyTicketProcedureOperation: TicketUpdateMoneyTicketProcedureOperation,
    private readonly ticketUpdateMoneyTicketRegimenOperation: TicketUpdateMoneyTicketRegimenOperation,
    private readonly ticketUpdateUserTicketRegimenOperation: TicketUpdateUserTicketRegimenOperation,
    private readonly ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async addTicketProcedureList(options: {
    oid: number
    ticketId: number
    body: TicketAddTicketProcedureListBody
  }) {
    const { oid, ticketId, body } = options
    const result = await this.ticketAddTicketProcedureListOperation.addTicketProcedureList({
      oid,
      ticketId,
      ticketRegimenAddWrapList: body.ticketRegimenAddWrapList,
      ticketProcedureNormalWrapList: body.ticketProcedureNormalWrapList,
    })

    const { ticketModified, ticketRegimenCreatedList, ticketProcedureNormalCreatedList } = result

    this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      customerId: ticketModified.customerId,
      ticketProcedureNormalCreatedList,
      ticketRegimenCreatedList,
      ticketUserUpsertedList: result.ticketUserCreatedList,
    })

    return { ticketModified, ticketRegimenCreatedList, ticketProcedureNormalCreatedList }
  }

  async destroyTicketProcedure(options: {
    oid: number
    ticketId: number
    ticketProcedureId: number
  }) {
    const { oid, ticketId, ticketProcedureId } = options
    const result = await this.ticketDestroyTicketProcedureOperation.destroyTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
    })

    const { ticketModified } = result

    this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      customerId: ticketModified.customerId,
      ticketProcedureDestroyed: result.ticketProcedureDestroyed,
      ticketUserDestroyedList: result.ticketUserDestroyedList || [],
    })

    return { ticketId, ticketProcedureId }
  }

  async destroyTicketRegimen(options: { oid: number; ticketId: number; ticketRegimenId: number }) {
    const { oid, ticketId, ticketRegimenId } = options
    const result = await this.ticketDestroyTicketRegimenOperation.destroyTicketRegimen({
      oid,
      ticketId,
      ticketRegimenId,
    })

    const { ticketModified } = result

    this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      customerId: ticketModified.customerId,
      ticketRegimenDestroyed: result.ticketRegimenDestroyed,
      ticketUserDestroyedList: result.ticketUserDestroyedList || [],
    })

    return { ticketId, ticketRegimenId }
  }

  async updateMoneyTicketProcedure(options: {
    oid: number
    ticketId: number
    ticketProcedureId: number
    body: TicketUpdateMoneyTicketProcedureBody
  }) {
    const { oid, ticketId, ticketProcedureId, body } = options
    const updateResult =
      await this.ticketUpdateMoneyTicketProcedureOperation.updateMoneyTicketProcedure({
        oid,
        ticketId,
        ticketProcedureId,
        ticketProcedureUpdateDto: body,
      })
    const { ticketModified, ticketProcedureModified } = updateResult

    this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      customerId: ticketModified.customerId,
      ticketProcedureModifiedList: [ticketProcedureModified],
      ticketUserUpsertedList: updateResult.ticketUserCreatedList,
      ticketUserDestroyedList: updateResult.ticketUserDestroyedList,
    })

    return { ticketProcedureModified }
  }

  async updateUserRequestTicketProcedure(options: {
    oid: number
    ticketId: number
    ticketProcedureId: number
    body: TicketUpdateUserRequestTicketProcedureBody
  }) {
    const { oid, ticketId, ticketProcedureId, body } = options
    const updateResult =
      await this.ticketUpdateUserTicketProcedureOperation.updateUserTicketProcedure({
        oid,
        ticketId,
        ticketProcedureId,
        ticketUserUpdateList: body.ticketUserRequestList,
        positionType: PositionType.ProcedureRequest,
      })
    const { ticketModified, ticketProcedureModified } = updateResult

    this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      customerId: ticketModified.customerId,
      ticketProcedureModifiedList: [ticketProcedureModified],
      ticketUserUpsertedList: updateResult.ticketUserCreatedList,
      ticketUserDestroyedList: updateResult.ticketUserDestroyedList,
    })

    ticketProcedureModified.ticketUserRequestList = updateResult.ticketUserCreatedList || []
    return { ticketProcedureModified }
  }

  async updateUserResultTicketProcedure(options: {
    oid: number
    ticketId: number
    ticketProcedureId: number
    body: TicketUpdateUserResultTicketProcedureBody
  }) {
    const { oid, ticketId, ticketProcedureId, body } = options
    const updateResult =
      await this.ticketUpdateUserTicketProcedureOperation.updateUserTicketProcedure({
        oid,
        ticketId,
        ticketProcedureId,
        ticketUserUpdateList: body.ticketUserResultList,
        positionType: PositionType.ProcedureResult,
      })
    const { ticketModified, ticketProcedureModified } = updateResult
    ticketProcedureModified.ticketUserResultList = updateResult.ticketUserCreatedList || []

    this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      customerId: ticketModified.customerId,
      ticketProcedureModifiedList: [ticketProcedureModified],
      ticketUserUpsertedList: updateResult.ticketUserCreatedList,
      ticketUserDestroyedList: updateResult.ticketUserDestroyedList,
    })

    return { ticketProcedureModified }
  }

  async updatePriorityTicketProcedure(options: {
    oid: number
    ticketId: number
    body: TicketUpdatePriorityTicketProcedureBody
  }) {
    const { oid, ticketId, body } = options
    const ticketProcedureList = await this.ticketProcedureRepository.updatePriorityList({
      oid,
      ticketId,
      updateData: body.ticketProcedureList,
    })

    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      customerId: ticketProcedureList[0].customerId,
      // ticketProcedureUpsertedList: ticketProcedureList,
    })

    return { ticketProcedureList }
  }

  async updateMoneyTicketRegimen(options: {
    oid: number
    ticketId: number
    ticketRegimenId: number
    body: TicketUpdateMoneyTicketRegimenBody
  }) {
    const { oid, ticketId, ticketRegimenId, body } = options
    const updateResult =
      await this.ticketUpdateMoneyTicketRegimenOperation.updateMoneyTicketRegimen({
        oid,
        ticketId,
        ticketRegimenId,
        ticketRegimenUpdateDto: body.ticketRegimen,
        ticketProcedureUpdateList: body.ticketProcedureList,
      })
    const { ticketModified, ticketRegimenModified } = updateResult

    this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      customerId: ticketModified.customerId,
      ticketRegimenModified,
      ticketUserUpsertedList: updateResult.ticketUserCreatedList,
      ticketUserDestroyedList: updateResult.ticketUserDestroyedList,
    })

    return { ticketRegimenModified }
  }

  async updateUserRequestTicketRegimen(options: {
    oid: number
    ticketId: number
    ticketRegimenId: number
    body: TicketUpdateUserRequestTicketRegimenBody
  }) {
    const { oid, ticketId, ticketRegimenId, body } = options
    const updateResult = await this.ticketUpdateUserTicketRegimenOperation.updateUserTicketRegimen({
      oid,
      ticketId,
      ticketRegimenId,
      positionType: PositionType.RegimenRequest,
      ticketUserRequestList: body.ticketUserRequestList,
    })
    const { ticketModified, ticketRegimenModified } = updateResult

    this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      customerId: ticketModified.customerId,
      ticketRegimenModified,
      ticketUserUpsertedList: updateResult.ticketUserCreatedList,
      ticketUserDestroyedList: updateResult.ticketUserDestroyedList,
    })

    return { ticketRegimenModified }
  }

  async updateResultTicketProcedure(options: {
    oid: number
    ticketId: number
    ticketProcedureId: number
    body: TicketProcedureUpdateResultBody
    files: FileUploadDto[]
  }) {
    const { oid, ticketId, ticketProcedureId, body, files } = options

    const ticketProcedureOrigin = await this.ticketProcedureRepository.findOneBy({
      oid,
      id: ticketProcedureId,
    })

    const { customerId } = ticketProcedureOrigin
    let imageIdsUpdateString = ticketProcedureOrigin.imageIds
    let imageDestroyedList: Image[] = []
    let imageCreatedList: Image[] = []
    if (body.imagesChange) {
      const imageChangeResponse = await this.imageManagerService.changeCloudinaryImageLink({
        oid,
        files,
        imageIdsWait: body.imagesChange.imageIdsWait,
        externalUrlList: body.imagesChange.externalUrlList,
        imageIdsOld: JSON.parse(ticketProcedureOrigin.imageIds),
        imageInteract: {
          imageInteractType: ImageInteractType.Customer,
          imageInteractId: customerId,
          ticketId,
          ticketItemId: ticketProcedureId,
        },
      })
      imageIdsUpdateString = JSON.stringify(imageChangeResponse.imageIdsNew)

      imageDestroyedList = imageChangeResponse.imageDestroyedList
      imageCreatedList = imageChangeResponse.imageCreatedList
    }

    const ticketProcedureModified = await this.ticketProcedureRepository.updateOneAndReturnEntity(
      { oid, id: ticketProcedureId },
      {
        ticketId,
        result: body.ticketProcedure.result,
        completedAt: body.ticketProcedure.completedAt,
        imageIds: imageIdsUpdateString,
        status: TicketProcedureStatus.Completed,
      }
    )

    if (ticketProcedureModified.imageIds !== '[]') {
      let imageIdList: number[] = []
      try {
        imageIdList = JSON.parse(ticketProcedureModified.imageIds)
      } catch (error) {
        imageIdList = []
      }
      if (imageIdList.length) {
        const imageList = await this.imageRepository.findManyBy({
          oid,
          id: { IN: imageIdList },
        })
        const imageMap = ESArray.arrayToKeyValue(imageList, 'id')
        ticketProcedureModified.imageList = imageIdList.map((imageId) => {
          return imageMap[imageId]
        })
      }
    }

    let ticketRegimenModified: TicketRegimen
    if (
      ticketProcedureOrigin.ticketProcedureType === TicketProcedureType.InRegimen
      && ticketProcedureOrigin.status !== TicketProcedureStatus.Completed
    ) {
      const ticketProcedureList = await this.ticketProcedureRepository.findMany({
        condition: { oid, customerId, ticketRegimenId: ticketProcedureOrigin.ticketRegimenId },
        sort: { completedAt: 'ASC', id: 'ASC' },
      })
      const everyCompleted = ticketProcedureList.every((i) => {
        return i.status === TicketProcedureStatus.Completed
      })

      ticketRegimenModified = await this.ticketRegimenRepository.updateOneAndReturnEntity(
        { oid, id: ticketProcedureOrigin.ticketRegimenId },
        { status: everyCompleted ? TicketRegimenStatus.Completed : TicketRegimenStatus.Executing }
      )

      if (ticketProcedureModified.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect) {
        const ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          oid,
          ticketId,
          itemMoney: {
            procedureMoneyAdd:
              ticketProcedureModified.actualPrice * ticketProcedureModified.quantity,
            itemsDiscountAdd:
              ticketProcedureModified.discountMoney * ticketProcedureModified.quantity,
            commissionMoneyAdd: 0,
          },
        })
        this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
      }
    }

    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      customerId: ticketProcedureModified.customerId,
      ticketProcedureModifiedList: [ticketProcedureModified],
      ticketRegimenModified: ticketRegimenModified || undefined,
      imageDestroyedList,
      imageUpsertedList: imageCreatedList,
    })

    return { ticketProcedureModified, ticketRegimenModified }
  }

  async cancelResultTicketProcedure(options: { oid: number; ticketProcedureId: number }) {
    const { oid, ticketProcedureId } = options

    const ticketProcedureOrigin = await this.ticketProcedureRepository.findOneBy({
      oid,
      id: ticketProcedureId,
    })
    const { ticketId, customerId } = ticketProcedureOrigin

    const { imageDestroyedList } = await this.imageManagerService.removeImageList({
      oid,
      idRemoveList: JSON.parse(ticketProcedureOrigin.imageIds),
    })

    const ticketUserDestroyList = await this.ticketUserRepository.deleteAndReturnEntity({
      oid,
      ticketId,
      positionType: PositionType.ProcedureResult,
      ticketItemId: ticketProcedureOrigin.id,
    })

    const ticketProcedureModified = await this.ticketProcedureRepository.updateOneAndReturnEntity(
      { oid, ticketId, id: ticketProcedureId },
      {
        ticketId: 0,
        status: TicketProcedureStatus.Pending,
        result: '',
        imageIds: JSON.stringify([]),
        completedAt: null,
        commissionAmount: 0,
      }
    )

    let ticketRegimenModified: TicketRegimen
    if (ticketProcedureOrigin.ticketProcedureType === TicketProcedureType.InRegimen) {
      const ticketProcedureList = await this.ticketProcedureRepository.findMany({
        condition: { oid, customerId, ticketRegimenId: ticketProcedureOrigin.ticketRegimenId },
        sort: { completedAt: 'ASC', id: 'ASC' },
      })
      const everyPending = ticketProcedureList.every((i) => {
        return i.status === TicketProcedureStatus.Pending
      })
      ticketRegimenModified = await this.ticketRegimenRepository.updateOneAndReturnEntity(
        { oid, id: ticketProcedureOrigin.ticketRegimenId },
        { status: everyPending ? TicketRegimenStatus.Pending : TicketRegimenStatus.Executing }
      )
      if (ticketProcedureModified.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect) {
        const ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          oid,
          ticketId,
          itemMoney: {
            procedureMoneyAdd:
              -ticketProcedureModified.actualPrice * ticketProcedureModified.quantity,
            itemsDiscountAdd:
              -ticketProcedureModified.discountMoney * ticketProcedureModified.quantity,
            commissionMoneyAdd: ticketUserDestroyList.reduce((acc, item) => {
              return acc + item.quantity * item.commissionMoney
            }, 0),
          },
        })
        this.socketEmitService.socketTicketListChange(oid, { ticketUpsertedList: [ticketModified] })
      }
    }

    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      customerId: ticketProcedureOrigin.customerId,
      ticketProcedureModifiedList: [ticketProcedureModified],
      ticketRegimenModified: ticketRegimenModified || undefined,
      imageDestroyedList,
    })

    return { ticketProcedureModified, ticketRegimenModified }
  }
}
