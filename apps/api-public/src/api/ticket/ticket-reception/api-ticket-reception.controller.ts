import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermissionOr } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketParams } from '../ticket-query/request'
import { TicketReceptionCreateTicketBody, TicketReceptionUpdateTicketBody } from './request'
import { TicketReceptionService } from './ticket-reception.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class ApiTicketReceptionController {
  constructor(private readonly ticketReceptionService: TicketReceptionService) { }

  @Post('reception-create')
  @UserPermissionOr(PermissionId.TICKET_DRAFT_CRUD)
  async receptionCreate(
    @External() { oid }: TExternal,
    @Body() body: TicketReceptionCreateTicketBody
  ): Promise<BaseResponse> {
    const data = await this.ticketReceptionService.receptionCreate({
      oid,
      body,
    })
    return { data }
  }

  @Post('/:ticketId/reception-update')
  @UserPermissionOr(PermissionId.TICKET_DRAFT_CRUD)
  async receptionUpdate(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketReceptionUpdateTicketBody
  ): Promise<BaseResponse> {
    const data = await this.ticketReceptionService.receptionUpdate({
      oid,
      ticketId,
      body,
    })
    return { data }
  }
}
