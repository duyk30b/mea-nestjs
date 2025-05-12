import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { HasPermission } from '../../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/database/entities/permission.entity'
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
  @HasPermission(PermissionId.TICKET_CLINIC_USER_UPDATE_COMMISSION)
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
  @HasPermission(PermissionId.TICKET_CLINIC_USER_UPDATE_COMMISSION)
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
  @HasPermission(PermissionId.TICKET_CLINIC_USER_CHOOSE_USERID)
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
