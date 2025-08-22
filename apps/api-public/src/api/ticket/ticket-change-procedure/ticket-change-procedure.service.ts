/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { TicketProcedureStatus } from '../../../../../_libs/database/common/variable'
import { PositionInteractType } from '../../../../../_libs/database/entities/position.entity'
import {
  TicketAddTicketProcedureListOperation,
  TicketDestroyTicketProcedureOperation,
  TicketUpdateTicketProcedureOperation,
} from '../../../../../_libs/database/operations'
import {
  TicketProcedureItemRepository,
  TicketProcedureRepository,
} from '../../../../../_libs/database/repositories'
import { ImageManagerService } from '../../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { ApiTicketProcedureService } from '../../api-ticket-procedure/api-ticket-procedure.service'
import { TicketUserAddBody } from '../ticket-change-user/request'
import { TicketChangeUserService } from '../ticket-change-user/ticket-change-user.service'
import {
  TicketAddTicketProcedureListBody,
  TicketUpdatePriorityTicketProcedureBody,
  TicketUpdateTicketProcedureBody,
} from './request'
import { TicketProcedureUpdateResultBody } from './request/ticket-procedure-update-result.request'

@Injectable()
export class TicketChangeProcedureService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketProcedureRepository: TicketProcedureRepository,
    private readonly ticketProcedureItemRepository: TicketProcedureItemRepository,
    private readonly ticketAddTicketProcedureListOperation: TicketAddTicketProcedureListOperation,
    private readonly ticketClinicDestroyTicketProcedureOperation: TicketDestroyTicketProcedureOperation,
    private readonly ticketClinicUpdateTicketProcedureOperation: TicketUpdateTicketProcedureOperation,
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
      ticketProcedureDtoList: body.ticketProcedureList.map((i) => {
        return {
          ...i.ticketProcedure,
          ticketProcedureItemAddList: i.ticketProcedureItemList,
        }
      }),
    })

    const { ticketModified, ticketProcedureCreatedList } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: ticketModified })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      ticketProcedureUpsertList: ticketProcedureCreatedList,
    })

    const ticketUserListBody = body.ticketProcedureList.map((i) => i.ticketUserList).flat()
    if (ticketUserListBody.length) {
      this.ticketChangeUserService.addTicketUserPositionList({
        oid,
        ticketId,
        body: {
          ticketUserList: body.ticketProcedureList
            .map((i, tpIndex) => {
              return i.ticketUserList.map((j) => {
                const ticketProcedureCreated = ticketProcedureCreatedList[tpIndex]
                const itemBody: TicketUserAddBody = {
                  ...j,
                  positionType: PositionInteractType.Procedure,
                  positionInteractId: ticketProcedureCreated.procedureId,
                  ticketItemId: ticketProcedureCreated.id,
                  quantity: ticketProcedureCreated.quantity,
                }
                return itemBody
              })
            })
            .flat(),
        },
      })
    }
    return true
  }

  async destroyTicketProcedure(options: {
    oid: number
    ticketId: number
    ticketProcedureId: number
  }) {
    const { oid, ticketId, ticketProcedureId } = options
    const result = await this.ticketClinicDestroyTicketProcedureOperation.destroyTicketProcedure({
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
    const result = await this.ticketClinicUpdateTicketProcedureOperation.updateTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
      ticketProcedureUpdateDto: body.ticketProcedure,
      ticketProcedureItemUpdateList: body.ticketProcedureItemList,
    })
    const { ticket, ticketProcedure } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      ticketProcedureUpsertList: [ticketProcedure],
    })
    if (body.ticketUserList) {
      this.ticketChangeUserService.updateTicketUserPositionList({
        oid,
        ticketId,
        body: {
          positionType: PositionInteractType.Procedure,
          positionInteractId: ticketProcedure.procedureId,
          ticketItemId: ticketProcedure.id,
          quantity: ticketProcedure.quantity,
          ticketUserList: body.ticketUserList,
        },
      })
    }
    return true
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
    ticketProcedureList.sort((a, b) => (a.priority < b.priority ? -1 : 1))

    this.socketEmitService.socketTicketProcedureListChange(oid, {
      ticketId,
      ticketProcedureUpsertList: ticketProcedureList,
    })

    return true
  }

  async updateResultTicketProcedureItem(options: {
    oid: number
    ticketId: number
    body: TicketProcedureUpdateResultBody
    files: FileUploadDto[]
  }) {
    const { oid, ticketId, body, files } = options

    const ticketProcedureOrigin = await this.ticketProcedureRepository.findOneBy({
      oid,
      id: body.ticketProcedureItem.ticketProcedureId,
    })
    const ticketProcedureItemOrigin = await this.ticketProcedureItemRepository.findOneBy({
      oid,
      id: body.ticketProcedureItem.ticketProcedureItemId,
      ticketProcedureId: body.ticketProcedureItem.ticketProcedureId,
    })
    const { customerId } = ticketProcedureOrigin

    let imageIdsUpdateString = ticketProcedureItemOrigin.imageIds
    if (body.imagesChange) {
      const imageIdsUpdate = await this.imageManagerService.changeCloudinaryImageLink({
        oid,
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
    if (ticketProcedureItemOrigin.status !== TicketProcedureStatus.Completed) {
      ticketProcedureModified = await this.ticketProcedureRepository.updateOneAndReturnEntity(
        {
          oid,
          ticketId,
          id: body.ticketProcedureItem.ticketProcedureId,
        },
        {
          completedSessions: ticketProcedureOrigin.completedSessions + 1,
          status:
            ticketProcedureOrigin.completedSessions + 1 < ticketProcedureOrigin.totalSessions
              ? TicketProcedureStatus.Executing
              : TicketProcedureStatus.Completed,
        }
      )
    }

    // check ?.length, vì nếu có setup user, thì dù không điền vẫn gửi userId = 0 lên
    if (body.ticketUserList?.length) {
      this.ticketChangeUserService.updateTicketUserPositionList({
        oid,
        ticketId,
        body: {
          positionType: PositionInteractType.Procedure,
          positionInteractId: ticketProcedureOrigin.procedureId,
          ticketItemId: ticketProcedureOrigin.id,
          quantity: 1,
          ticketUserList: body.ticketUserList,
        },
      })
    }

    await this.apiTicketProcedureService.generateRelation({
      ticketProcedureList: [ticketProcedureModified],
      oid,
      relation: { ticketProcedureItemList: { imageList: true } },
    }),
      this.socketEmitService.socketTicketProcedureListChange(oid, {
        ticketId,
        ticketProcedureUpsertList: [ticketProcedureModified],
      })

    return { ticketProcedure: ticketProcedureModified }
  }
}
