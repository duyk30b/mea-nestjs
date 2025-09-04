import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse, FastifyFilesInterceptor } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketParams } from '../ticket-query/request'
import {
  TicketCancelResultProcedureItemBody,
  TicketChangeProcedureParams,
  TicketUpdatePriorityTicketProcedureBody,
  TicketUpdateRequestTicketProcedureBody,
} from './request'
import { TicketAddTicketProcedureListBody } from './request/ticket-add-ticket-procedure-list.body'
import { TicketProcedureUpdateResultBody } from './request/ticket-update-result-procedure.request'
import { TicketChangeProcedureService } from './ticket-change-procedure.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class TicketChangeProcedureController {
  constructor(private readonly ticketChangeProcedureService: TicketChangeProcedureService) { }

  @Post(':ticketId/procedure/add-ticket-procedure-list')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async addTicketProcedureList(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketAddTicketProcedureListBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.addTicketProcedureList({
      oid,
      ticketId,
      body,
    })
    return { data }
  }

  @Delete(':ticketId/procedure/destroy-ticket-procedure/:ticketProcedureId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async destroyTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketChangeProcedureParams
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.destroyTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
    })
    return { data }
  }

  @Post(':ticketId/procedure/update-request-ticket-procedure/:ticketProcedureId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async updateRequestTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketChangeProcedureParams,
    @Body() body: TicketUpdateRequestTicketProcedureBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.updateRequestTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/procedure/update-priority-ticket-procedure')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async updatePriorityTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketUpdatePriorityTicketProcedureBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.updatePriorityTicketProcedure({
      oid,
      ticketId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/procedure/update-result-ticket-procedure-item')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_RESULT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async updateResultTicketProcedureItem(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketProcedureUpdateResultBody,
    @UploadedFiles() files: FileUploadDto[]
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.updateResultTicketProcedureItem({
      oid,
      ticketId,
      body,
      files,
    })
    return { data }
  }

  @Post(':ticketId/procedure/cancel-result-ticket-procedure-item')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_RESULT)
  async cancelResultTicketProcedureItem(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketCancelResultProcedureItemBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.cancelResultTicketProcedureItem({
      oid,
      ticketId,
      body,
    })
    return { data }
  }
}
