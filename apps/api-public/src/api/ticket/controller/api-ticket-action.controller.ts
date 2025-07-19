import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermissionOr } from '../../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketParams, TicketReturnProductListBody, TicketSendProductListBody } from '../request'
import { TicketChangeAllMoneyBody } from '../request/ticket-change-all-money.body'
import { TicketActionService } from '../service/ticket-action.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class ApiTicketActionController {
  constructor(private readonly ticketActionService: TicketActionService) { }

  @Post('change-all-money/:ticketId')
  @UserPermissionOr(PermissionId.RECEPTION_CHANGE_ALL_MONEY)
  async changeAllMoney(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketChangeAllMoneyBody
  ) {
    return await this.ticketActionService.changeAllMoney({ oid, body, ticketId })
  }

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
  @UserPermissionOr(
    PermissionId.RECEPTION_RETURN_PRODUCT,
    PermissionId.TICKET_CLINIC_RETURN_PRODUCT
  )
  async returnProduct(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketReturnProductListBody
  ) {
    return await this.ticketActionService.returnProduct({ oid, body, ticketId })
  }

  @Post('close/:ticketId')
  @UserPermissionOr(PermissionId.RECEPTION_CLOSE_TICKET, PermissionId.TICKET_CLINIC_CLOSE)
  async close(@External() { oid, uid }: TExternal, @Param() { ticketId }: TicketParams) {
    return await this.ticketActionService.close({ oid, userId: uid, ticketId })
  }

  @Post('reopen/:ticketId')
  @UserPermissionOr(PermissionId.RECEPTION_REOPEN_TICKET, PermissionId.TICKET_CLINIC_REOPEN)
  async reopen(@External() { oid, uid }: TExternal, @Param() { ticketId }: TicketParams) {
    return await this.ticketActionService.reopen({ oid, userId: uid, ticketId })
  }

  @Delete('destroy/:ticketId')
  @UserPermissionOr(PermissionId.RECEPTION_DESTROY_TICKET, PermissionId.TICKET_CLINIC_DESTROY)
  async destroy(@External() { oid }: TExternal, @Param() { ticketId }: TicketParams) {
    return await this.ticketActionService.destroy({
      oid,
      ticketId,
    })
  }
}
