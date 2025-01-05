import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { HasPermission } from '../../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/database/entities/permission.entity'
import { ApiTicketClinicProcedureService } from './api-ticket-clinic-procedure.service'
import {
  TicketClinicAddTicketProcedureBody,
  TicketClinicDestroyTicketProcedureParams,
  TicketClinicUpdatePriorityTicketProcedureBody,
  TicketClinicUpdateTicketProcedureBody,
} from './request'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicProcedureController {
  constructor(private readonly apiTicketClinicProcedureService: ApiTicketClinicProcedureService) { }

  @Post(':id/add-ticket-procedure')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PROCEDURE_LIST)
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
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PROCEDURE_LIST)
  async destroyTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketClinicDestroyTicketProcedureParams
  ) {
    return await this.apiTicketClinicProcedureService.destroyTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
    })
  }

  @Post(':id/update-ticket-procedure')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PROCEDURE_LIST)
  async updateTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateTicketProcedureBody
  ) {
    return await this.apiTicketClinicProcedureService.updateTicketProcedure({
      oid,
      ticketId: id,
      body,
    })
  }

  @Post(':id/update-ticket-procedure-list')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PROCEDURE_LIST)
  async updateTicketProcedureList(
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
