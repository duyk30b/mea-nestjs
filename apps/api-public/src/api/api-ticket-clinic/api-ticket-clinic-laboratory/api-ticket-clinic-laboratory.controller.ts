import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { HasPermission } from '../../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/database/entities/permission.entity'
import { TicketParams } from '../../api-ticket/request/ticket.params'
import { ApiTicketClinicLaboratoryService } from './api-ticket-clinic-laboratory.service'
import {
  TicketClinicLaboratoryGroupParams,
  TicketClinicLaboratoryParams,
  TicketClinicUpdatePriorityTicketLaboratoryBody,
  TicketClinicUpdateTicketLaboratoryBody,
  TicketClinicUpsertLaboratoryBody,
  TicketLaboratoryResultUpdateBody,
} from './request'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicLaboratoryController {
  constructor(
    private readonly apiTicketClinicLaboratoryService: ApiTicketClinicLaboratoryService
  ) { }

  @Post(':ticketId/upsert-laboratory')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_LABORATORY_LIST)
  async upsertLaboratory(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketClinicUpsertLaboratoryBody
  ) {
    return await this.apiTicketClinicLaboratoryService.upsertLaboratory({
      oid,
      ticketId,
      body,
    })
  }

  @Delete(':ticketId/destroy-ticket-laboratory/:ticketLaboratoryId')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_LABORATORY_LIST)
  async destroyTicketLaboratory(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketLaboratoryId }: TicketClinicLaboratoryParams
  ) {
    return await this.apiTicketClinicLaboratoryService.destroyTicketLaboratory({
      oid,
      ticketId,
      ticketLaboratoryId,
    })
  }

  @Delete(':ticketId/destroy-ticket-laboratory-group/:ticketLaboratoryGroupId')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_LABORATORY_LIST)
  async destroyTicketLaboratoryGroup(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketLaboratoryGroupId }: TicketClinicLaboratoryGroupParams
  ) {
    return await this.apiTicketClinicLaboratoryService.destroyTicketLaboratoryGroup({
      oid,
      ticketId,
      ticketLaboratoryGroupId,
    })
  }

  @Post(':ticketId/update-ticket-laboratory/:ticketLaboratoryId')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PROCEDURE_LIST)
  async updateTicketLaboratory(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketLaboratoryId }: TicketClinicLaboratoryParams,
    @Body() body: TicketClinicUpdateTicketLaboratoryBody
  ) {
    return await this.apiTicketClinicLaboratoryService.updateTicketLaboratory({
      oid,
      ticketId,
      ticketLaboratoryId,
      body,
    })
  }

  @Post(':id/update-ticket-laboratory-result')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_LABORATORY_LIST)
  async updateTicketLaboratoryResult(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketLaboratoryResultUpdateBody
  ) {
    return await this.apiTicketClinicLaboratoryService.updateTicketLaboratoryResult({
      oid,
      ticketId: id,
      body,
    })
  }

  @Post(':id/update-priority-ticket-laboratory')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_LABORATORY_LIST)
  async updatePriorityTicketLaboratory(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdatePriorityTicketLaboratoryBody
  ) {
    return await this.apiTicketClinicLaboratoryService.updatePriorityTicketLaboratory({
      oid,
      ticketId: id,
      body,
    })
  }
}
