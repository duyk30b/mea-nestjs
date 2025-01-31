import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { HasPermission } from '../../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/database/entities/permission.entity'
import { ApiTicketClinicLaboratoryService } from './api-ticket-clinic-laboratory.service'
import {
  TicketClinicAddTicketLaboratoryListBody,
  TicketClinicLaboratoryParams,
  TicketClinicUpdatePriorityTicketLaboratoryBody,
  TicketClinicUpdateTicketLaboratoryBody,
  TicketLaboratoryUpdateResultBody,
} from './request'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicLaboratoryController {
  constructor(
    private readonly apiTicketClinicLaboratoryService: ApiTicketClinicLaboratoryService
  ) { }

  @Post(':id/add-ticket-laboratory-list')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_LABORATORY_LIST)
  async addTicketLaboratoryList(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicAddTicketLaboratoryListBody
  ) {
    return await this.apiTicketClinicLaboratoryService.addTicketLaboratoryList({
      oid,
      ticketId: id,
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

  @Post(':id/update-result-ticket-laboratory')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_LABORATORY_LIST)
  async updateResultTicketLaboratory(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketLaboratoryUpdateResultBody
  ) {
    return await this.apiTicketClinicLaboratoryService.updateResultTicketLaboratory({
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
