import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { PositionInteractType } from '../../../../_libs/database/entities/position.entity'
import { TicketRadiologyStatus } from '../../../../_libs/database/entities/ticket-radiology.entity'
import {
  CustomerRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../_libs/database/repositories'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { TicketRadiologyRepository } from '../../../../_libs/database/repositories/ticket-radiology.repository'
import { ImageManagerService } from '../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { ApiTicketClinicUserService } from '../api-ticket-clinic/api-ticket-clinic-user/api-ticket-clinic-user.service'
import { ApiTicketRadiologyService } from './api-ticket-radiology.service'
import {
  TicketRadiologyCancelResultBody,
  TicketRadiologyPostQuery,
  TicketRadiologyUpdateResultBody,
} from './request'

@Injectable()
export class ApiTicketRadiologyAction {
  constructor(
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private readonly imageRepository: ImageRepository,
    private readonly apiTicketRadiologyService: ApiTicketRadiologyService,
    private readonly apiTicketClinicUserService: ApiTicketClinicUserService
  ) { }

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
      this.apiTicketClinicUserService.changeTicketUserList({
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

    return { data: { ticketRadiology: ticketRadiologyModified } }
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
    return { data: { ticketRadiology: ticketRadiologyModified } }
    // Không cần xóa TicketUser, nếu thay đổi kết quả hoặc xóa phiếu thì cập nhật sau cũng không sao
  }
}
