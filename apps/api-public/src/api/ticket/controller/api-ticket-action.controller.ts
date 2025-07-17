import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission, UserPermissionOr } from '../../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketParams, TicketReturnProductListBody, TicketSendProductListBody } from '../request'
import { TicketActionService } from '../service/ticket-action.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class ApiTicketActionController {
  constructor(private readonly ticketActionService: TicketActionService) { }

  @Post('send-product/:ticketId')
  @UserPermissionOr(PermissionId.RECEPTION_SEND_PRODUCT, PermissionId.TICKET_CLINIC_SEND_PRODUCT)
  async sendProduct(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketSendProductListBody
  ) {
    return await this.ticketActionService.sendProduct({ oid, body, ticketId })
  }

  @Post('return-product/:ticketId')
  @UserPermission(PermissionId.RECEPTION_RETURN_PRODUCT, PermissionId.TICKET_CLINIC_RETURN_PRODUCT)
  async returnProduct(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketReturnProductListBody
  ) {
    return await this.ticketActionService.returnProduct({ oid, body, ticketId })
  }

  @Post('close/:ticketId')
  @UserPermission(PermissionId.RECEPTION_CLOSE_TICKET, PermissionId.TICKET_CLINIC_CLOSE)
  async close(@External() { oid, uid }: TExternal, @Param() { ticketId }: TicketParams) {
    return await this.ticketActionService.close({ oid, userId: uid, ticketId })
  }

  @Post('reopen/:ticketId')
  @UserPermission(PermissionId.RECEPTION_REOPEN_TICKET, PermissionId.TICKET_CLINIC_REOPEN)
  async reopen(@External() { oid, uid }: TExternal, @Param() { ticketId }: TicketParams) {
    return await this.ticketActionService.reopen({ oid, userId: uid, ticketId })
  }

  @Delete('destroy/:ticketId')
  @UserPermission(PermissionId.RECEPTION_DESTROY_TICKET, PermissionId.TICKET_CLINIC_DESTROY)
  async destroy(@External() { oid }: TExternal, @Param() { ticketId }: TicketParams) {
    return await this.ticketActionService.destroy({
      oid,
      ticketId,
    })
  }
}
