import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { HasPermission } from '../../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/database/entities/permission.entity'
import { ApiTicketClinicAttributeService } from './api-ticket-clinic-attribute.service'
import {
  TicketClinicUpdateTicketAttributeListBody,
} from './request'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicAttributeController {
  constructor(private readonly apiTicketClinicAttributeService: ApiTicketClinicAttributeService) { }

  @Post(':id/update-ticket-attribute-list')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_ATTRIBUTE)
  async updateTicketAttributeList(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateTicketAttributeListBody
  ) {
    return await this.apiTicketClinicAttributeService.updateTicketAttributeList({
      oid,
      ticketId: id,
      body,
    })
  }
}
