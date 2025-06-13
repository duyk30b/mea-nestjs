import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { ApiTicketClinicProcedureService } from './api-ticket-clinic-procedure.service'
import {
  TicketClinicAddTicketProcedureBody,
  TicketClinicProcedureParams,
  TicketClinicUpdatePriorityTicketProcedureBody,
  TicketClinicUpdateTicketProcedureBody,
} from './request'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicProcedureController {
  constructor(private readonly apiTicketClinicProcedureService: ApiTicketClinicProcedureService) { }

  @Post(':id/add-ticket-procedure')
  @UserPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PROCEDURE_LIST)
  async addTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicAddTicketProcedureBody
  ) {
    return await this.apiTicketClinicProcedureService.addTicketProcedure({
      oid,
      ticketId: id,
      body,
    })
  }

  @Delete(':ticketId/destroy-ticket-procedure/:ticketProcedureId')
  @UserPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PROCEDURE_LIST)
  async destroyTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketClinicProcedureParams
  ) {
    return await this.apiTicketClinicProcedureService.destroyTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
    })
  }

  @Post(':ticketId/update-ticket-procedure/:ticketProcedureId')
  @UserPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PROCEDURE_LIST)
  async updateTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketClinicProcedureParams,
    @Body() body: TicketClinicUpdateTicketProcedureBody
  ) {
    return await this.apiTicketClinicProcedureService.updateTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
      body,
    })
  }

  @Post(':id/update-priority-ticket-procedure')
  @UserPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PROCEDURE_LIST)
  async updatePriorityTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdatePriorityTicketProcedureBody
  ) {
    return await this.apiTicketClinicProcedureService.updatePriorityTicketProcedure({
      oid,
      ticketId: id,
      body,
    })
  }
}
