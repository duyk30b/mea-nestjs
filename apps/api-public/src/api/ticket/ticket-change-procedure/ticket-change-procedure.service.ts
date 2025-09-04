/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { TicketProcedureStatus } from '../../../../../_libs/database/common/variable'
import { TicketUser } from '../../../../../_libs/database/entities'
import { AppointmentStatus } from '../../../../../_libs/database/entities/appointment.entity'
import Image, { ImageInteractType } from '../../../../../_libs/database/entities/image.entity'
import { PositionType } from '../../../../../_libs/database/entities/position.entity'
import { ProcedureType } from '../../../../../_libs/database/entities/procedure.entity'
import {
  TicketAddTicketProcedureListOperation,
  TicketChangeTicketUserOperation,
  TicketDestroyTicketProcedureOperation,
  TicketUpdateTicketProcedureOperation,
} from '../../../../../_libs/database/operations'
import {
  AppointmentRepository,
  TicketProcedureItemRepository,
  TicketProcedureRepository,
  TicketUserRepository,
} from '../../../../../_libs/database/repositories'
import { ImageManagerService } from '../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { ApiTicketProcedureService } from '../../api-ticket-procedure/api-ticket-procedure.service'
import {
  TicketAddTicketProcedureListBody,
  TicketCancelResultProcedureItemBody,
  TicketProcedureUpdateResultBody,
  TicketUpdatePriorityTicketProcedureBody,
  TicketUpdateRequestTicketProcedureBody,
} from './request'

@Injectable()
export class TicketChangeProcedureService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketProcedureRepository: TicketProcedureRepository,
    private readonly ticketProcedureItemRepository: TicketProcedureItemRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly ticketAddTicketProcedureListOperation: TicketAddTicketProcedureListOperation,
    private readonly ticketDestroyTicketProcedureOperation: TicketDestroyTicketProcedureOperation,
    private readonly ticketUpdateTicketProcedureOperation: TicketUpdateTicketProcedureOperation,
    private readonly ticketChangeTicketUserOperation: TicketChangeTicketUserOperation,
    private readonly apiTicketProcedureService: ApiTicketProcedureService
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
      ticketProcedureDtoList: body.ticketProcedureWrapList.map((i) => {
        return {
          ticketProcedureAdd: i.ticketProcedure,
          ticketProcedureItemAddList: i.ticketProcedureItemList,
          ticketUserRequestAddList: i.ticketUserRequestList,
        }
      }),
    })

    const { ticketModified, ticketProcedureCreatedList, ticketUserCreatedList } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: ticketModified })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      ticketProcedureUpsertedList: ticketProcedureCreatedList,
      ticketUserUpsertedList: ticketUserCreatedList,
    })

    ticketProcedureCreatedList.forEach((tr) => {
      tr.ticketUserRequestList = ticketUserCreatedList.filter((tu) => {
        return tr.id === tu.ticketItemId
      })
    })

    return { ticketModified, ticketProcedureCreatedList }
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

    const { ticket } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      ticketProcedureDestroyedList: [result.ticketProcedureDestroyed],
      ticketUserDestroyedList: result.ticketUserDestroyedList || [],
    })

    return { ticketId, ticketProcedureId }
  }

  async updateRequestTicketProcedure(options: {
    oid: number
    ticketId: number
    ticketProcedureId: number
    body: TicketUpdateRequestTicketProcedureBody
  }) {
    const { oid, ticketId, ticketProcedureId, body } = options
    const updateResult = await this.ticketUpdateTicketProcedureOperation.updateTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
      ticketProcedureUpdateDto: body.ticketProcedure,
      ticketProcedureItemUpdateList: body.ticketProcedureItemList,
      ticketUserRequestList: body.ticketUserRequestList,
    })
    const { ticketModified, ticketProcedureModified } = updateResult

    await this.apiTicketProcedureService.generateRelation({
      oid,
      ticketProcedureList: [ticketProcedureModified],
      relation: { ticketProcedureItemList: { imageList: true } },
    })

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: ticketModified })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      ticketProcedureUpsertedList: [ticketProcedureModified],
      ticketUserUpsertedList: updateResult.ticketUserCreatedList,
      ticketUserDestroyedList: updateResult.ticketUserDestroyedList,
    })

    ticketProcedureModified.ticketUserRequestList = updateResult.ticketUserCreatedList || []
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
      ticketProcedureUpsertedList: ticketProcedureList,
    })

    return { ticketProcedureList }
  }

  async updateResultTicketProcedureItem(options: {
    oid: number
    ticketId: number
    body: TicketProcedureUpdateResultBody
    files: FileUploadDto[]
  }) {
    const { oid, ticketId, body, files } = options
    const { ticketProcedureId, ticketProcedureItemId } = body.ticketProcedureItem

    const ticketProcedureOrigin = await this.ticketProcedureRepository.findOneBy({
      oid,
      id: ticketProcedureId,
    })
    const ticketProcedureItemOrigin = await this.ticketProcedureItemRepository.findOneBy({
      oid,
      id: ticketProcedureItemId,
      ticketProcedureId,
    })
    const { customerId } = ticketProcedureOrigin
    if (ticketProcedureItemOrigin.status === TicketProcedureStatus.Pending) {
      if (ticketProcedureItemOrigin.indexSession !== ticketProcedureOrigin.finishedSessions) {
        throw new BusinessError(
          `Không đúng buổi thực hiện, hiện tại cần thực hiện buổi ${ticketProcedureOrigin.finishedSessions + 1}`
        )
      }
    }

    let imageIdsUpdateString = ticketProcedureItemOrigin.imageIds
    let imageDestroyedList: Image[] = []
    let imageCreatedList: Image[] = []
    if (body.imagesChange) {
      const imageChangeResponse = await this.imageManagerService.changeCloudinaryImageLink({
        oid,
        files,
        imageIdsWait: body.imagesChange.imageIdsWait,
        externalUrlList: body.imagesChange.externalUrlList,
        imageIdsOld: JSON.parse(ticketProcedureItemOrigin.imageIds),
        imageInteract: {
          imageInteractType: ImageInteractType.Customer,
          imageInteractId: customerId,
          ticketId,
          ticketItemId: ticketProcedureId,
          ticketItemChildId: ticketProcedureItemId,
        },
      })
      imageIdsUpdateString = JSON.stringify(imageChangeResponse.imageIdsNew)

      imageDestroyedList = imageChangeResponse.imageDestroyedList
      imageCreatedList = imageChangeResponse.imageCreatedList
    }

    const ticketProcedureItemModified =
      await this.ticketProcedureItemRepository.updateOneAndReturnEntity(
        {
          oid,
          ticketId,
          id: body.ticketProcedureItem.ticketProcedureItemId,
        },
        {
          result: body.ticketProcedureItem.result,
          completedAt: body.ticketProcedureItem.completedAt,
          imageIds: imageIdsUpdateString,
          status: TicketProcedureStatus.Completed,
        }
      )

    let ticketProcedureModified = ticketProcedureOrigin
    if (ticketProcedureItemOrigin.status === TicketProcedureStatus.Pending) {
      ticketProcedureModified = await this.ticketProcedureRepository.updateOneAndReturnEntity(
        {
          oid,
          ticketId,
          id: ticketProcedureId,
        },
        {
          finishedSessions: ticketProcedureOrigin.finishedSessions + 1,
          status:
            ticketProcedureOrigin.finishedSessions + 1 < ticketProcedureOrigin.totalSessions
              ? TicketProcedureStatus.Executing
              : TicketProcedureStatus.Completed,
        }
      )
      if (ticketProcedureModified.procedureType === ProcedureType.Regimen) {
        await this.appointmentRepository.updateOneAndReturnEntity(
          {
            oid,
            customerId: ticketProcedureOrigin.customerId,
            fromTicketId: ticketId,
            toTicketId: ticketId,
            ticketProcedureId,
            ticketProcedureItemId,
          },
          {
            status: AppointmentStatus.Completed,
            cancelReason: '',
          }
        )
      }
    }

    let ticketUserCreatedList: TicketUser[] = []
    let ticketUserDestroyedList: TicketUser[] = []
    if (body.ticketUserResultList) {
      const changeUserResult = await this.ticketChangeTicketUserOperation.changeTicketUserList({
        oid,
        ticketId,
        createdAt: ticketProcedureItemModified.completedAt,
        ticketUserDtoList: body.ticketUserResultList.map((i) => {
          return {
            ...i,
            ticketItemId: ticketProcedureId,
            ticketItemChildId: ticketProcedureItemId,
            positionInteractId: ticketProcedureModified.procedureId,
            quantity: 1,
            ticketItemExpectedPrice: ticketProcedureModified.expectedPrice,
            ticketItemActualPrice: ticketProcedureModified.actualPrice,
          }
        }),
        destroy: {
          positionType: PositionType.ProcedureResult,
          ticketItemId: ticketProcedureId,
          ticketItemChildId: ticketProcedureItemId,
        },
      })
      ticketUserCreatedList = changeUserResult.ticketUserCreatedList
      ticketUserDestroyedList = changeUserResult.ticketUserDestroyedList
      this.socketEmitService.socketTicketChange(oid, {
        type: 'UPDATE',
        ticket: changeUserResult.ticketModified,
      })
    }

    await this.apiTicketProcedureService.generateRelation({
      ticketProcedureList: [ticketProcedureModified],
      oid,
      relation: {
        ticketProcedureItemList: { imageList: true, ticketUserResultList: true },
        ticketUserRequestList: true,
      },
    })

    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      ticketProcedureUpsertedList: [ticketProcedureModified],
      ticketUserUpsertedList: ticketUserCreatedList,
      ticketUserDestroyedList,
      imageDestroyedList,
      imageUpsertedList: imageCreatedList,
    })

    return { ticketProcedureModified }
  }

  async cancelResultTicketProcedureItem(options: {
    oid: number
    ticketId: number
    body: TicketCancelResultProcedureItemBody
  }) {
    const { oid, ticketId, body } = options
    const { ticketProcedureId, ticketProcedureItemId } = body

    const ticketProcedureOrigin = await this.ticketProcedureRepository.findOneBy({
      oid,
      id: ticketProcedureId,
    })
    const ticketProcedureItemOrigin = await this.ticketProcedureItemRepository.findOneBy({
      oid,
      id: ticketProcedureItemId,
      ticketProcedureId,
    })
    const { customerId } = ticketProcedureOrigin

    if (ticketProcedureItemOrigin.indexSession !== ticketProcedureOrigin.finishedSessions) {
      throw new BusinessError(
        `Hủy buổi hẹn không phù hợp, hiện tại cần hủy buổi ${ticketProcedureOrigin.finishedSessions + 1}`
      )
    }

    if (ticketProcedureItemOrigin.status === TicketProcedureStatus.Completed) {
      await this.imageManagerService.removeImageList({
        oid,
        idRemoveList: JSON.parse(ticketProcedureItemOrigin.imageIds),
      })
    }

    const ticketProcedureItemModified =
      await this.ticketProcedureItemRepository.updateOneAndReturnEntity(
        { oid, ticketId, id: ticketProcedureItemId },
        {
          status: TicketProcedureStatus.Cancelled,
          result: body.cancelReason,
          imageIds: JSON.stringify([]),
        }
      )

    let ticketProcedureModified = ticketProcedureOrigin
    if (ticketProcedureItemOrigin.status === TicketProcedureStatus.Pending) {
      ticketProcedureModified = await this.ticketProcedureRepository.updateOneAndReturnEntity(
        { oid, ticketId, id: ticketProcedureId },
        {
          finishedSessions: ticketProcedureOrigin.finishedSessions + 1,
          status:
            ticketProcedureOrigin.finishedSessions + 1 < ticketProcedureOrigin.totalSessions
              ? TicketProcedureStatus.Executing
              : TicketProcedureStatus.Completed,
        }
      )
    }

    if (ticketProcedureModified.procedureType === ProcedureType.Regimen) {
      await this.appointmentRepository.updateOneAndReturnEntity(
        {
          oid,
          customerId: ticketProcedureOrigin.customerId,
          fromTicketId: ticketId,
          toTicketId: ticketId,
          ticketProcedureId,
          ticketProcedureItemId,
        },
        {
          status: AppointmentStatus.Cancelled,
          cancelReason: body.cancelReason,
        }
      )
    }

    let ticketUserDestroyedList: TicketUser[] = []
    if (ticketProcedureItemOrigin.status === TicketProcedureStatus.Completed) {
      ticketUserDestroyedList = await this.ticketUserRepository.deleteAndReturnEntity({
        oid,
        positionType: PositionType.ProcedureResult,
        ticketId,
        ticketItemId: ticketProcedureId,
        ticketItemChildId: ticketProcedureItemId,
      })
    }

    await this.apiTicketProcedureService.generateRelation({
      ticketProcedureList: [ticketProcedureModified],
      oid,
      relation: {
        ticketProcedureItemList: { imageList: true, ticketUserResultList: true },
        ticketUserRequestList: true,
      },
    })

    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      ticketProcedureUpsertedList: [ticketProcedureModified],
      ticketUserDestroyedList,
    })

    return { ticketProcedureModified }
  }
}
