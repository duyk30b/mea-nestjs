import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { HasPermission } from '../../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/database/entities/permission.entity'
import { ApiTicketClinicUserService } from './api-ticket-clinic-user.service'
import {
  TicketClinicUserParams,
} from './request'
import { TicketClinicUpdateTicketUserListBody } from './request/ticket-clinic-update-user-list.body'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicUserController {
  constructor(private readonly apiTicketClinicUserService: ApiTicketClinicUserService) { }

  @Delete(':ticketId/destroy-ticket-user/:ticketUserId')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PROCEDURE_LIST)
  async destroyTicketUser(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketUserId }: TicketClinicUserParams
  ) {
    return await this.apiTicketClinicUserService.destroyTicketUser({
      oid,
      ticketId,
      ticketUserId,
    })
  }

  @Post(':id/update-ticket-user-item')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_USER_LIST)
  async updateTicketUserList(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateTicketUserListBody
  ) {
    return await this.apiTicketClinicUserService.updateTicketUserItem({
      oid,
      ticketId: id,
      body,
    })
  }
}
