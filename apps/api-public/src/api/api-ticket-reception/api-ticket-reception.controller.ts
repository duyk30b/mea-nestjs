import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { TicketParams } from '../api-ticket/request'
import { ApiTicketReceptionService } from './api-ticket-reception.service'
import { TicketReceptionCreateTicketBody, TicketReceptionUpdateTicketBody } from './request'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-reception')
export class ApiTicketReceptionController {
  constructor(private readonly apiTicketReceptionService: ApiTicketReceptionService) { }

  @Post('create-ticket')
  @UserPermission(PermissionId.RECEPTION_CRUD_TICKET_DRAFT)
  async create(@External() { oid }: TExternal, @Body() body: TicketReceptionCreateTicketBody) {
    return await this.apiTicketReceptionService.create({
      oid,
      body,
    })
  }

  @Post('update-ticket/:ticketId')
  @UserPermission(PermissionId.RECEPTION_CRUD_TICKET_DRAFT)
  async update(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketReceptionUpdateTicketBody
  ) {
    return await this.apiTicketReceptionService.update({
      oid,
      ticketId,
      body,
    })
  }

  @Delete('destroy-ticket/:ticketId')
  @UserPermission(PermissionId.TICKET_CLINIC_DESTROY_DRAFT_SCHEDULE)
  async destroy(@External() { oid }: TExternal, @Param() { ticketId }: TicketParams) {
    return await this.apiTicketReceptionService.destroy({
      oid,
      ticketId,
    })
  }
}
