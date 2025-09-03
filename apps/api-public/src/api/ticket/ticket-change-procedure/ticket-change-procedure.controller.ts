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
  TicketCancelProcedureItemBody,
  TicketChangeProcedureParams,
  TicketUpdatePriorityTicketProcedureBody,
  TicketUpdateTicketProcedureBody,
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
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE)
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
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE)
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

  @Post(':ticketId/procedure/update-ticket-procedure/:ticketProcedureId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE)
  async updateTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketChangeProcedureParams,
    @Body() body: TicketUpdateTicketProcedureBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.updateTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/procedure/update-priority-ticket-procedure')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE)
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

  @Post(':ticketId/procedure/cancel-ticket-procedure-item')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_RESULT)
  async cancelTicketProcedureItem(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketCancelProcedureItemBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.cancelTicketProcedureItem({
      oid,
      ticketId,
      body,
    })
    return { data }
  }
}
