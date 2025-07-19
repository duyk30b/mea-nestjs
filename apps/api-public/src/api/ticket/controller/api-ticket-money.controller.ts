import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission, UserPermissionOr } from '../../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketClinicChangeDiscountBody, TicketParams, TicketPaymentMoneyBody } from '../request'
import { TicketMoneyService } from '../service/ticket-money.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class ApiTicketMoneyController {
  constructor(private readonly ticketMoneyService: TicketMoneyService) { }

  @Post('prepayment/:ticketId')
  @UserPermissionOr(PermissionId.RECEIPT_PAYMENT, PermissionId.TICKET_CLINIC_PAYMENT)
  async prepayment(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketPaymentMoneyBody
  ) {
    return await this.ticketMoneyService.prepayment({ oid, userId: uid, ticketId, body })
  }

  @Post('refund-overpaid/:ticketId')
  @UserPermissionOr(PermissionId.RECEPTION_REFUND_OVER_PAID, PermissionId.TICKET_CLINIC_REFUND_OVERPAID)
  async refundOverpaid(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketPaymentMoneyBody
  ) {
    return await this.ticketMoneyService.refundOverpaid({
      oid,
      userId: uid,
      ticketId,
      body,
    })
  }

  @Post('pay-debt/:ticketId')
  @UserPermission(PermissionId.RECEIPT_PAYMENT, PermissionId.TICKET_CLINIC_PAYMENT)
  async payDebt(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketPaymentMoneyBody
  ) {
    return await this.ticketMoneyService.payDebt({ oid, userId: uid, ticketId, body })
  }

  @Post('change-discount/:ticketId')
  @UserPermission(PermissionId.RECEPTION_CHANGE_DISCOUNT_TICKET)
  async changeDiscount(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketClinicChangeDiscountBody
  ) {
    return await this.ticketMoneyService.changeDiscount({ oid, ticketId, body })
  }
}
