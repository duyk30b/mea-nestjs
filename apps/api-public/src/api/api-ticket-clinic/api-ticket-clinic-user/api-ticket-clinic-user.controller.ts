import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketParams } from '../../api-ticket/request/ticket.params'
import { ApiTicketClinicUserService } from './api-ticket-clinic-user.service'
import {
  TicketClinicUpdateTicketUserBody,
  TicketClinicUserParams,
} from './request'
import { TicketClinicUpdateTicketUserListBody } from './request/ticket-clinic-update-user-list.body'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicUserController {
  constructor(private readonly apiTicketClinicUserService: ApiTicketClinicUserService) { }

  @Delete(':ticketId/ticket-user/destroy/:ticketUserId')
  @UserPermission(PermissionId.TICKET_CLINIC_USER_UPDATE_POSITION)
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

  @Post(':ticketId/ticket-user/update/:ticketUserId')
  @UserPermission(PermissionId.TICKET_CLINIC_USER_UPDATE_POSITION)
  async updateTicketUser(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketUserId }: TicketClinicUserParams,
    @Body() body: TicketClinicUpdateTicketUserBody
  ) {
    return await this.apiTicketClinicUserService.updateTicketUser({
      oid,
      ticketId,
      ticketUserId,
      body,
    })
  }

  @Post(':ticketId/ticket-user/choose-user-id')
  @UserPermission(PermissionId.TICKET_CLINIC_USER_CHOOSE_USERID)
  async chooseUserId(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketClinicUpdateTicketUserListBody
  ) {
    return await this.apiTicketClinicUserService.changeTicketUserList({
      oid,
      ticketId,
      body,
    })
  }
}
