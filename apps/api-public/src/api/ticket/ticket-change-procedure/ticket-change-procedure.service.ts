/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { TicketProcedureStatus } from '../../../../../_libs/database/common/variable'
import { TicketUser } from '../../../../../_libs/database/entities'
import { AppointmentStatus } from '../../../../../_libs/database/entities/appointment.entity'
import { PositionType } from '../../../../../_libs/database/entities/position.entity'
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
import { TicketChangeUserService } from '../ticket-change-user/ticket-change-user.service'
import {
  TicketAddTicketProcedureListBody,
  TicketCancelProcedureItemBody,
  TicketProcedureUpdateResultBody,
  TicketUpdatePriorityTicketProcedureBody,
  TicketUpdateTicketProcedureBody,
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
    private readonly ticketChangeUserService: TicketChangeUserService,
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
      ticketProcedureUpsertList: ticketProcedureCreatedList,
    })
    this.socketEmitService.socketTicketUserListChange(oid, {
      ticketId,
      ticketUserUpsertList: ticketUserCreatedList,
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
      ticketProcedureDestroyList: [result.ticketProcedureDestroy],
    })
    if (result.ticketUserDestroyList) {
      this.socketEmitService.socketTicketUserListChange(oid, {
        ticketId,
        ticketUserDestroyList: result.ticketUserDestroyList,
      })
    }

    return true
  }

  async updateTicketProcedure(options: {
    oid: number
    ticketId: number
    ticketProcedureId: number
    body: TicketUpdateTicketProcedureBody
  }) {
    const { oid, ticketId, ticketProcedureId, body } = options
    const result = await this.ticketUpdateTicketProcedureOperation.updateTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
      ticketProcedureUpdateDto: body.ticketProcedure,
      ticketProcedureItemUpdateList: body.ticketProcedureItemList,
      ticketUserRequestList: body.ticketUserRequestList,
    })
    const { ticketModified, ticketProcedureModified } = result

    await this.apiTicketProcedureService.generateRelation({
      oid,
      ticketProcedureList: [ticketProcedureModified],
      relation: { ticketProcedureItemList: { imageList: true } },
    })

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: ticketModified })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      ticketProcedureUpsertList: [ticketProcedureModified],
    })
    this.socketEmitService.socketTicketUserListChange(oid, {
      ticketId,
      ticketUserUpsertList: result.ticketUserCreatedList,
      ticketUserDestroyList: result.ticketUserDestroyList,
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
      ticketProcedureUpsertList: ticketProcedureList,
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
    if (body.imagesChange) {
      const imageIdsUpdate = await this.imageManagerService.changeCloudinaryImageLink({
        oid,
        ticketId,
        customerId,
        files,
        imageIdsWait: body.imagesChange.imageIdsWait,
        externalUrlList: body.imagesChange.externalUrlList,
        imageIdsOld: JSON.parse(ticketProcedureItemOrigin.imageIds),
      })
      imageIdsUpdateString = JSON.stringify(imageIdsUpdate)
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

    let ticketUserList: TicketUser[] = []
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
      ticketUserList = changeUserResult.ticketUserCreatedList
      this.socketEmitService.socketTicketChange(oid, {
        type: 'UPDATE',
        ticket: changeUserResult.ticketModified,
      })
      this.socketEmitService.socketTicketUserListChange(oid, {
        ticketId,
        ticketUserUpsertList: changeUserResult.ticketUserCreatedList,
        ticketUserDestroyList: changeUserResult.ticketUserDestroyList,
      })
    }

    await this.apiTicketProcedureService.generateRelation({
      ticketProcedureList: [ticketProcedureModified],
      oid,
      relation: {
        ticketProcedureItemList: { imageList: true, ticketUserResultList: true },
        ticketUserRequestList: true,
      },
    }),
      this.socketEmitService.socketTicketProcedureListChange(oid, {
        ticketId,
        ticketProcedureUpsertList: [ticketProcedureModified],
      })

    return { ticketProcedureModified }
  }

  async cancelTicketProcedureItem(options: {
    oid: number
    ticketId: number
    body: TicketCancelProcedureItemBody
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

    if (ticketProcedureItemOrigin.status === TicketProcedureStatus.Completed) {
      await this.ticketUserRepository.deleteAndReturnEntity({
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
      ticketProcedureUpsertList: [ticketProcedureModified],
    })

    return { ticketProcedureModified }
  }
}
