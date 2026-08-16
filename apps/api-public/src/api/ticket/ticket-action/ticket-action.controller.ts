import { UserPermission, UserPermissionOr } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { TicketParams } from '../ticket-query/request'
import {
  TicketChangeAllMoneyBody,
  TicketChangeSurchargeListBody,
  TicketClinicChangeDiscountBody,
  TicketReturnProductListBody,
  TicketShipProductListBody,
  TicketTerminalBody,
} from './request'
import { TicketChangeAllMoneyService } from './service/ticket-change-all-money.service'
import { TicketActionService } from './ticket-action.service'
import { TicketCancelService } from './ticket-cancel.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class TicketActionController {
  constructor(
    private readonly ticketActionService: TicketActionService,
    private readonly ticketCancelService: TicketCancelService,
    private readonly ticketChangeAllMoneyService: TicketChangeAllMoneyService
  ) {}

  @Post('/:ticketId/start-executing')
  @UserPermission(PermissionId.TICKET_START_EXECUTING)
  async startExecuting(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.startExecuting({ oid, ticketId })
    return { data }
  }

  @Post('/:ticketId/change-discount')
  @UserPermission(PermissionId.TICKET_CHANGE_DISCOUNT)
  async changeDiscount(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketClinicChangeDiscountBody
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.changeDiscount({ oid, ticketId, body })
    return { data }
  }

  @Post('/:ticketId/change-surcharge-list')
  @UserPermission(PermissionId.TICKET_CHANGE_SURCHARGE_LIST)
  async changeSurchargeList(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketChangeSurchargeListBody
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.changeSurchargeList({ oid, ticketId, body })
    return { data }
  }

  @Post('/:ticketId/change-all-money')
  @UserPermission(PermissionId.TICKET_CHANGE_DISCOUNT)
  async changeAllMoney(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketChangeAllMoneyBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeAllMoneyService.changeAllMoney({ oid, body, ticketId })
    return { data }
  }

  @Post('/:ticketId/ship-product-all')
  @UserPermission(PermissionId.TICKET_CHANGE_PRODUCT_SHIP_PRODUCT)
  async shipProductAll(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.shipProduct({
      oid,
      ticketId,
      shipType: 'ALL',
    })
    return { data }
  }

  @Post('/:ticketId/ship-product-list')
  @UserPermission(PermissionId.TICKET_CHANGE_PRODUCT_SHIP_PRODUCT)
  async shipProduct(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketShipProductListBody
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.shipProduct({
      oid,
      ticketId,
      shipType: 'PARTIAL',
      shipList: body.shipProductList,
    })
    return { data }
  }

  @Post('/:ticketId/return-product-all')
  @UserPermission(PermissionId.TICKET_CHANGE_PRODUCT_RETURN_PRODUCT)
  async returnProductAll(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.returnProduct({
      oid,
      ticketId,
      returnType: 'ALL',
      options: { changePendingIfNoStock: true },
    })
    return { data }
  }

  @Post('/:ticketId/return-product-list')
  @UserPermission(PermissionId.TICKET_CHANGE_PRODUCT_RETURN_PRODUCT)
  async returnProductList(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketReturnProductListBody
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.returnProduct({
      oid,
      ticketId,
      returnType: 'PARTIAL',
      returnList: body.returnProductList,
    })
    return { data }
  }

  @Post('/:ticketId/close')
  @UserPermissionOr(PermissionId.TICKET_CLOSE)
  async close(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.close({ oid, userId: uid, ticketId })
    return { data }
  }

  @Post('/:ticketId/reopen')
  @UserPermissionOr(PermissionId.TICKET_REOPEN)
  async reopen(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.reopen({ oid, ticketId })
    return { data }
  }

  @Post('/:ticketId/terminate')
  @UserPermissionOr(PermissionId.TICKET_TERMINATE)
  async terminate(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketTerminalBody
  ): Promise<BaseResponse> {
    const data = await this.ticketCancelService.terminate({
      oid,
      userId: uid,
      ticketId,
      body,
    })
    return { data }
  }

  @Post('/:ticketId/destroy')
  @UserPermissionOr(PermissionId.TICKET_DESTROY)
  async destroy(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams
  ): Promise<BaseResponse> {
    const data = await this.ticketCancelService.destroy({
      oid,
      ticketId,
    })
    return { data }
  }
}
