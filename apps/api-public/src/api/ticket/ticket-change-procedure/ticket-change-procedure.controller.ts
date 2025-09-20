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
  TicketChangeProcedureParams,
  TicketChangeRegimenParams,
  TicketUpdateMoneyTicketProcedureBody,
  TicketUpdateMoneyTicketRegimenBody,
  TicketUpdatePriorityTicketProcedureBody,
  TicketUpdateUserRequestTicketProcedureBody,
  TicketUpdateUserRequestTicketRegimenBody,
  TicketUpdateUserResultTicketProcedureBody,
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

  @Delete(':ticketId/procedure/destroy-ticket-regimen/:ticketRegimenId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async destroyTicketRegimen(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketRegimenId }: TicketChangeRegimenParams
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.destroyTicketRegimen({
      oid,
      ticketId,
      ticketRegimenId,
    })
    return { data }
  }

  @Post(':ticketId/procedure/update-money-ticket-procedure/:ticketProcedureId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async updateMoneyTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketChangeProcedureParams,
    @Body() body: TicketUpdateMoneyTicketProcedureBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.updateMoneyTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/procedure/update-user-request-ticket-procedure/:ticketProcedureId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async updateUserRequestTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketChangeProcedureParams,
    @Body() body: TicketUpdateUserRequestTicketProcedureBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.updateUserRequestTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/procedure/update-user-result-ticket-procedure/:ticketProcedureId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async updateUserResultTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketChangeProcedureParams,
    @Body() body: TicketUpdateUserResultTicketProcedureBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.updateUserResultTicketProcedure({
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

  @Post(':ticketId/procedure/update-money-ticket-regimen/:ticketRegimenId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async updateMoneyTicketRegimen(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketRegimenId }: TicketChangeRegimenParams,
    @Body() body: TicketUpdateMoneyTicketRegimenBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.updateMoneyTicketRegimen({
      oid,
      ticketId,
      ticketRegimenId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/procedure/update-user-request-ticket-regimen/:ticketRegimenId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async updateUserTicketRegimen(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketRegimenId }: TicketChangeRegimenParams,
    @Body() body: TicketUpdateUserRequestTicketRegimenBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.updateUserRequestTicketRegimen({
      oid,
      ticketId,
      ticketRegimenId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/procedure/update-result-ticket-procedure/:ticketProcedureId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_RESULT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async updateResultTicketProcedureNormal(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketChangeProcedureParams,
    @Body() body: TicketProcedureUpdateResultBody,
    @UploadedFiles() files: FileUploadDto[]
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.updateResultTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
      body,
      files,
    })
    return { data }
  }

  @Post(':ticketId/procedure/cancel-result-ticket-procedure/:ticketProcedureId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_RESULT)
  async cancelResultTicketProcedureItem(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketChangeProcedureParams
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.cancelResultTicketProcedure({
      oid,
      ticketProcedureId,
    })
    return { data }
  }
}
