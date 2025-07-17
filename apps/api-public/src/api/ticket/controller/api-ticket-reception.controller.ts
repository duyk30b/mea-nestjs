import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import {
  TicketParams,
  TicketReceptionCreateTicketBody,
  TicketReceptionUpdateTicketBody,
} from '../request'
import { TicketReceptionService } from '../service/ticket-reception.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class ApiTicketReceptionController {
  constructor(private readonly ticketReceptionService: TicketReceptionService) { }

  @Post('reception-create')
  @UserPermission(PermissionId.RECEPTION_CRUD_TICKET_DRAFT, PermissionId.TICKET_CLINIC_CREATE)
  async receptionCreate(@External() { oid }: TExternal, @Body() body: TicketReceptionCreateTicketBody) {
    return await this.ticketReceptionService.receptionCreate({
      oid,
      body,
    })
  }

  @Post('reception-update/:ticketId')
  @UserPermission(PermissionId.RECEPTION_CRUD_TICKET_DRAFT, PermissionId.TICKET_CLINIC_CREATE)
  async receptionUpdate(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketReceptionUpdateTicketBody
  ) {
    return await this.ticketReceptionService.receptionUpdate({
      oid,
      ticketId,
      body,
    })
  }
}
