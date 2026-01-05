import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse, FastifyFilesInterceptor } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketRadiologyPostQuery } from '../../api-ticket-radiology/request'
import { TicketParams } from '../ticket-query/request'
import {
  TicketAddTicketRadiologyListBody,
  TicketCancelResultTicketRadiologyBody,
  TicketChangeRadiologyParams,
  TicketUpdatePriorityTicketRadiologyBody,
  TicketUpdateRequestTicketRadiologyBody,
  TicketUpdateResultTicketRadiologyBody,
} from './request'
import { TicketAddTicketRadiologyListService } from './service/ticket-add-ticket-radiology-list.operation'
import { TicketChangeRadiologyService } from './ticket-change-radiology.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class TicketChangeRadiologyController {
  constructor(
    private readonly ticketChangeRadiologyService: TicketChangeRadiologyService,
    private readonly ticketAddTicketRadiologyListService: TicketAddTicketRadiologyListService
  ) { }

  @Post(':ticketId/radiology/add-ticket-radiology-list')
  @UserPermission(PermissionId.TICKET_CHANGE_RADIOLOGY_REQUEST)
  async addTicketRadiologyList(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketAddTicketRadiologyListBody
  ): Promise<BaseResponse> {
    const data = await this.ticketAddTicketRadiologyListService.addTicketRadiologyList({
      oid,
      ticketId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/radiology/destroy-ticket-radiology/:ticketRadiologyId')
  @UserPermission(PermissionId.TICKET_CHANGE_RADIOLOGY_REQUEST)
  async destroyTicketRadiology(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketRadiologyId }: TicketChangeRadiologyParams
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeRadiologyService.destroyTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyId,
    })
    return { data }
  }

  @Post(':ticketId/radiology/update-request-ticket-radiology/:ticketRadiologyId')
  @UserPermission(PermissionId.TICKET_CHANGE_RADIOLOGY_REQUEST)
  async updateRequestTicketRadiology(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketRadiologyId }: TicketChangeRadiologyParams,
    @Body() body: TicketUpdateRequestTicketRadiologyBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeRadiologyService.updateRequestTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/radiology/update-priority-ticket-radiology')
  @UserPermission(PermissionId.TICKET_CHANGE_RADIOLOGY_REQUEST)
  async updatePriorityTicketRadiology(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketUpdatePriorityTicketRadiologyBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeRadiologyService.updatePriorityTicketRadiology({
      oid,
      ticketId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/radiology/update-result/:ticketRadiologyId')
  @UserPermission(PermissionId.TICKET_CHANGE_RADIOLOGY_RESULT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async updateResultTicketRadiology(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketRadiologyId }: TicketChangeRadiologyParams,
    @Body() body: TicketUpdateResultTicketRadiologyBody,
    @Query() query: TicketRadiologyPostQuery,
    @UploadedFiles() files: FileUploadDto[]
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeRadiologyService.updateResultTicketRadiology({
      oid,
      ticketRadiologyId,
      body,
      query,
      files,
    })
    return { data }
  }

  @Post(':ticketId/radiology/cancel-result/:ticketRadiologyId')
  @UserPermission(PermissionId.TICKET_CHANGE_RADIOLOGY_RESULT)
  async cancelResultTicketRadiology(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketRadiologyId }: TicketChangeRadiologyParams,
    @Body() body: TicketCancelResultTicketRadiologyBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeRadiologyService.cancelResultTicketRadiology({
      oid,
      ticketRadiologyId,
      body,
    })
    return { data }
  }
}
