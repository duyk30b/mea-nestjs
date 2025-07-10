import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { ApiTicketClinicRadiologyService } from './api-ticket-clinic-radiology.service'
import {
  TicketClinicAddTicketRadiologyBody,
  TicketClinicRadiologyParams,
  TicketClinicUpdateMoneyTicketRadiologyBody,
  TicketClinicUpdatePriorityTicketRadiologyBody,
} from './request'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicRadiologyController {
  constructor(private readonly apiTicketClinicRadiologyService: ApiTicketClinicRadiologyService) { }

  @Post(':id/add-ticket-radiology')
  @UserPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY_LIST)
  async addTicketRadiology(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicAddTicketRadiologyBody
  ) {
    return await this.apiTicketClinicRadiologyService.addTicketRadiology({
      oid,
      ticketId: id,
      body,
    })
  }

  @Delete(':ticketId/destroy-ticket-radiology/:ticketRadiologyId')
  @UserPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY_LIST)
  async destroyTicketRadiology(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketRadiologyId }: TicketClinicRadiologyParams
  ) {
    return await this.apiTicketClinicRadiologyService.destroyTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyId,
    })
  }

  @Post(':ticketId/update-money-ticket-radiology/:ticketRadiologyId')
  @UserPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY_LIST)
  async updateTicketLaboratory(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketRadiologyId }: TicketClinicRadiologyParams,
    @Body() body: TicketClinicUpdateMoneyTicketRadiologyBody
  ) {
    return await this.apiTicketClinicRadiologyService.updateMoneyTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyId,
      body,
    })
  }

  @Post(':id/update-priority-ticket-radiology')
  @UserPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY_LIST)
  async updatePriorityTicketRadiology(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdatePriorityTicketRadiologyBody
  ) {
    return await this.apiTicketClinicRadiologyService.updatePriorityTicketRadiology({
      oid,
      ticketId: id,
      body,
    })
  }
}
