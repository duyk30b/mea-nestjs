/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { PositionInteractType } from '../../../../../_libs/database/entities/position.entity'
import { TicketRadiologyStatus } from '../../../../../_libs/database/entities/ticket-radiology.entity'
import {
  TicketAddTicketRadiologyOperation,
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
import { TicketChangeUserService } from '../ticket-change-user/ticket-change-user.service'
import {
  TicketAddTicketRadiologyBody,
  TicketRadiologyCancelResultBody,
  TicketRadiologyUpdateResultBody,
  TicketUpdateMoneyTicketRadiologyBody,
  TicketUpdatePriorityTicketRadiologyBody,
} from './request'

@Injectable()
export class TicketChangeRadiologyService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly ticketRadiologyManager: TicketRadiologyManager,
    private readonly ticketAddTicketRadiologyOperation: TicketAddTicketRadiologyOperation,
    private readonly ticketDestroyTicketRadiologyOperation: TicketDestroyTicketRadiologyOperation,
    private readonly ticketUpdateTicketRadiologyOperation: TicketUpdateTicketRadiologyOperation,
    private readonly ticketChangeUserService: TicketChangeUserService,
    private readonly apiTicketRadiologyService: ApiTicketRadiologyService
  ) { }

  async addTicketRadiology(options: {
    oid: number
    ticketId: number
    body: TicketAddTicketRadiologyBody
  }) {
    const { oid, ticketId, body } = options
    const result = await this.ticketAddTicketRadiologyOperation.addTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyInsertDto: {
        ...body,
        oid,
        ticketId,
        imageIds: JSON.stringify([]),
        startedAt: null,
        status: TicketRadiologyStatus.Pending,
      },
    })

    const { ticket, ticketRadiology } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId,
      ticketRadiologyUpsertList: [ticketRadiology],
    })
    return true
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
      ticketRadiologyDestroyList: [result.ticketRadiologyDestroy],
    })
    if (result.ticketUserDestroyList.length) {
      this.socketEmitService.socketTicketUserListChange(oid, {
        ticketId,
        ticketUserDestroyList: result.ticketUserDestroyList,
      })
    }

    return true
  }

  async updateMoneyTicketRadiology(options: {
    oid: number
    ticketId: number
    ticketRadiologyId: number
    body: TicketUpdateMoneyTicketRadiologyBody
  }) {
    const { oid, ticketId, ticketRadiologyId, body } = options
    const result = await this.ticketUpdateTicketRadiologyOperation.updateMoneyTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyId,
      ticketRadiologyUpdateDto: body.ticketRadiology,
    })
    const { ticket, ticketRadiology } = result

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: result.ticket })
    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId,
      ticketRadiologyUpsertList: [result.ticketRadiology],
    })
    if (body.ticketUserList?.length) {
      this.ticketChangeUserService.updateTicketUserPositionList({
        oid,
        ticketId,
        body: {
          positionType: PositionInteractType.Radiology,
          positionInteractId: ticketRadiology.radiologyId,
          ticketItemId: ticketRadiology.id,
          quantity: 1,
          ticketUserList: body.ticketUserList,
        },
      })
    }
    return true
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

    ticketRadiologyList.sort((a, b) => (a.priority < b.priority ? -1 : 1))

    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId,
      ticketRadiologyUpsertList: ticketRadiologyList,
    })

    return true
  }

  async updateResult(options: {
    oid: number
    ticketRadiologyId: number
    body: TicketRadiologyUpdateResultBody
    query: TicketRadiologyPostQuery
    files: FileUploadDto[]
  }) {
    const { oid, ticketRadiologyId, body, files } = options
    const response = options.query?.response

    const ticketRadiologyOrigin = await this.ticketRadiologyRepository.findOneBy({
      oid,
      id: ticketRadiologyId,
    })
    const { ticketId, customerId } = ticketRadiologyOrigin

    let imageIdsUpdateString = ticketRadiologyOrigin.imageIds
    if (body.imagesChange) {
      const imageIdsUpdate = await this.imageManagerService.changeCloudinaryImageLink({
        oid,
        customerId,
        files,
        imageIdsWait: body.imagesChange.imageIdsWait,
        externalUrlList: body.imagesChange.externalUrlList,
        imageIdsOld: JSON.parse(ticketRadiologyOrigin.imageIds),
      })
      imageIdsUpdateString = JSON.stringify(imageIdsUpdate)
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
        startedAt: body.ticketRadiology.startedAt,
        imageIds: imageIdsUpdateString,
        status: TicketRadiologyStatus.Completed,
      }
    )

    // check ?.length, vì nếu có setup user, thì dù không điền vẫn gửi userId = 0 lên
    if (body.ticketUserList?.length) {
      this.ticketChangeUserService.updateTicketUserPositionList({
        oid,
        ticketId,
        body: {
          positionType: PositionInteractType.Radiology,
          positionInteractId: ticketRadiologyModified.radiologyId,
          ticketItemId: ticketRadiologyModified.id,
          quantity: 1,
          ticketUserList: body.ticketUserList,
        },
      })
    }

    await this.apiTicketRadiologyService.generateRelation([ticketRadiologyModified], {
      radiology: false,
      ticket: response?.ticketRadiology?.ticket,
      customer: response?.ticketRadiology?.customer,
      ticketUserList: response?.ticketRadiology?.ticketUserList,
      imageList: response?.ticketRadiology?.imageList,
    })

    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId,
      ticketRadiologyUpsertList: [ticketRadiologyModified],
    })

    return { ticketRadiology: ticketRadiologyModified }
  }

  async cancelResult(options: {
    oid: number
    ticketRadiologyId: number
    body: TicketRadiologyCancelResultBody
  }) {
    const { oid, ticketRadiologyId, body } = options

    const ticketRadiologyOrigin = await this.ticketRadiologyRepository.findOneBy({
      oid,
      id: ticketRadiologyId,
    })

    await this.imageManagerService.removeImageList({
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
        startedAt: null,
        imageIds: JSON.stringify([]),
        status: TicketRadiologyStatus.Pending,
      }
    )
    ticketRadiologyModified.imageList = []

    this.socketEmitService.socketTicketRadiologyListChange(oid, {
      ticketId: ticketRadiologyOrigin.ticketId,
      ticketRadiologyUpsertList: [ticketRadiologyModified],
    })
    return { ticketRadiology: ticketRadiologyModified }
    // Không cần xóa TicketUser, nếu thay đổi kết quả hoặc xóa phiếu thì cập nhật sau cũng không sao
  }
}
