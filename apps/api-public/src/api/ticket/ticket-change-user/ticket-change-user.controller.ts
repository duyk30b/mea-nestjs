import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketParams } from '../ticket-query/request/ticket.params'
import { TicketChangeUserParams, TicketUpdateTicketUserCommissionBody, TicketUpdateTicketUserPositionListBody } from './request'
import { TicketChangeUserService } from './ticket-change-user.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class TicketChangeUserController {
  constructor(private readonly ticketChangeUserService: TicketChangeUserService) { }

  @Delete(':ticketId/user/destroy-ticket-user/:ticketUserId')
  @UserPermission(PermissionId.TICKET_CHANGE_USER_POSITION)
  async destroyTicketUser(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketUserId }: TicketChangeUserParams
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeUserService.destroyTicketUser({
      oid,
      ticketId,
      ticketUserId,
    })
    return { data }
  }

  @Post(':ticketId/user/update-ticket-user-commission/:ticketUserId')
  @UserPermission(PermissionId.TICKET_CHANGE_USER_COMMISSION)
  async updateTicketUserCommission(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketUserId }: TicketChangeUserParams,
    @Body() body: TicketUpdateTicketUserCommissionBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeUserService.updateTicketUserCommission({
      oid,
      ticketId,
      ticketUserId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/user/update-ticket-user-position')
  @UserPermission(PermissionId.TICKET_CHANGE_USER_POSITION)
  async updateTicketUserPositionList(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketUpdateTicketUserPositionListBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeUserService.updateTicketUserPositionList({
      oid,
      ticketId,
      body,
    })
    return { data }
  }
}
