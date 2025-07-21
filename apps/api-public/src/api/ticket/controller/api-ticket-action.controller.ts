import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission, UserPermissionOr } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import {
  TicketClinicChangeDiscountBody,
  TicketParams,
  TicketReturnProductListBody,
  TicketSendProductListBody,
} from '../request'
import { TicketChangeAllMoneyBody } from '../request/ticket-change-all-money.body'
import { TicketActionService } from '../service/ticket-action.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class ApiTicketActionController {
  constructor(private readonly ticketActionService: TicketActionService) { }

  @Post('change-discount/:ticketId')
  @UserPermission(PermissionId.RECEPTION_CHANGE_DISCOUNT_TICKET)
  async changeDiscount(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketClinicChangeDiscountBody
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.changeDiscount({ oid, ticketId, body })
    return { data }
  }

  @Post('change-all-money/:ticketId')
  @UserPermissionOr(PermissionId.RECEPTION_CHANGE_ALL_MONEY)
  async changeAllMoney(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketChangeAllMoneyBody
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.changeAllMoney({ oid, body, ticketId })
    return { data }
  }

  @Post('send-product/:ticketId')
  @UserPermissionOr(PermissionId.RECEPTION_SEND_PRODUCT, PermissionId.TICKET_CLINIC_SEND_PRODUCT)
  async sendProduct(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketSendProductListBody
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.sendProduct({
      oid,
      ticketId,
      sendAll: false,
      ticketProductIdList: body.ticketProductIdList,
    })
    return { data }
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
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.returnProduct({
      oid,
      ticketId,
      returnAll: false,
      returnList: body.returnList,
    })
    return { data }
  }

  @Post('close/:ticketId')
  @UserPermissionOr(PermissionId.RECEPTION_CLOSE_TICKET, PermissionId.TICKET_CLINIC_CLOSE)
  async close(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.close({ oid, userId: uid, ticketId })
    return { data }
  }

  @Post('reopen/:ticketId')
  @UserPermissionOr(PermissionId.RECEPTION_REOPEN_TICKET, PermissionId.TICKET_CLINIC_REOPEN)
  async reopen(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.reopen({ oid, userId: uid, ticketId })
    return { data }
  }

  @Post('terminate/:ticketId')
  @UserPermissionOr(PermissionId.TICKET_ORDER_TERMINATE)
  async terminate(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.terminate({ oid, userId: uid, ticketId })
    return { data }
  }

  @Delete('destroy/:ticketId')
  @UserPermissionOr(PermissionId.RECEPTION_DESTROY_TICKET, PermissionId.TICKET_CLINIC_DESTROY)
  async destroy(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.destroy({
      oid,
      ticketId,
    })
    return { data }
  }
}
