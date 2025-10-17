import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission, UserPermissionOr } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketParams } from '../ticket-query/request'
import {
  TicketClinicChangeDiscountBody,
  TicketReturnProductListBody,
  TicketSendProductListBody,
} from './request'
import { TicketChangeAllMoneyBody } from './request/ticket-change-all-money.body'
import { TicketChangeSurchargeListBody } from './request/ticket-change-surcharge-list.body'
import { TicketChangeAllMoneyService } from './service/ticket-change-all-money.service'
import { TicketActionService } from './ticket-action.service'
import { TicketDestroyService } from './ticket-destroy.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class TicketActionController {
  constructor(
    private readonly ticketActionService: TicketActionService,
    private readonly ticketDestroyService: TicketDestroyService,
    private readonly ticketChangeAllMoneyService: TicketChangeAllMoneyService
  ) { }

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

  @Post('/:ticketId/send-product')
  @UserPermission(PermissionId.TICKET_CHANGE_PRODUCT_SEND_PRODUCT)
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

  @Post('/:ticketId/return-product')
  @UserPermission(PermissionId.TICKET_CHANGE_PRODUCT_RETURN_PRODUCT)
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
    const data = await this.ticketActionService.reopen({ oid, userId: uid, ticketId })
    return { data }
  }

  @Post('/:ticketId/terminate')
  @UserPermissionOr(PermissionId.TICKET_TERMINATE)
  async terminate(
    @External() { oid, uid }: TExternal,
    @Param() { ticketId }: TicketParams
  ): Promise<BaseResponse> {
    const data = await this.ticketActionService.terminate({ oid, userId: uid, ticketId })
    return { data }
  }

  @Delete('/:ticketId/destroy')
  @UserPermissionOr(PermissionId.TICKET_DESTROY)
  async destroy(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams
  ): Promise<BaseResponse> {
    const data = await this.ticketDestroyService.destroy({
      oid,
      ticketId,
    })
    return { data }
  }
}
