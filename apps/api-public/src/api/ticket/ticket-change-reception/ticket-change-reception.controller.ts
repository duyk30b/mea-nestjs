import { UserPermissionOr } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
    TicketChangeReceptionParams,
    TicketCreateTicketReceptionBody,
    TicketUpdateTicketReceptionBody,
} from './request'
import { TicketChangeReceptionService } from './ticket-change-reception.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class TicketChangeReceptionController {
  constructor(private readonly ticketChangeReceptionService: TicketChangeReceptionService) { }

  @Post('reception-create')
  @UserPermissionOr(PermissionId.TICKET_DRAFT_CRUD)
  async receptionCreate(
    @External() { oid }: TExternal,
    @Body() body: TicketCreateTicketReceptionBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeReceptionService.receptionCreate({
      oid,
      body,
    })
    return { data }
  }

  @Post('/:ticketId/reception-destroy/:ticketReceptionId')
  @UserPermissionOr(PermissionId.TICKET_DRAFT_CRUD)
  async receptionDestroy(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketReceptionId }: TicketChangeReceptionParams
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeReceptionService.receptionDestroy({
      oid,
      ticketId,
      ticketReceptionId,
    })
    return { data }
  }

  @Post('/:ticketId/reception-update/:ticketReceptionId')
  @UserPermissionOr(PermissionId.TICKET_DRAFT_CRUD)
  async receptionUpdate(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketReceptionId }: TicketChangeReceptionParams,
    @Body() body: TicketUpdateTicketReceptionBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeReceptionService.receptionUpdate({
      oid,
      ticketId,
      ticketReceptionId,
      body,
    })
    return { data }
  }
}
