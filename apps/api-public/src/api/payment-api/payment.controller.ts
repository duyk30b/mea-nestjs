import {
  PaymentGetManyQuery,
  PaymentPaginationQuery,
} from '@api-public/resource/payment-resource/payment.query'
import { PaymentResource } from '@api-public/resource/payment-resource/payment.resource'
import { GenerateIdParam } from '@libs/common/dto'
import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PaymentService } from './payment.service'
import { OtherPaymentBody, PaymentUpdateInfoBody } from './request'

@ApiTags('Payment')
@ApiBearerAuth('access-token')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly apiPaymentService: PaymentService,
    private readonly paymentService: PaymentService,
    private readonly paymentResource: PaymentResource
  ) {}

  @Get('pagination')
  @UserPermission() // tạm thời để thế này trước
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: PaymentPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentResource.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission() // tạm thời để thế này trước
  async list(
    @External() { oid }: TExternal,
    @Query() query: PaymentGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentResource.getMany(oid, query)
    return { data }
  }

  @Get('sum-money')
  @UserPermission() // tạm thời để thế này trước
  async sumMoney(
    @External() { oid }: TExternal,
    @Query() query: PaymentGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentResource.sumMoney(oid, query)
    return { data }
  }

  @Get('list-by-ticket-id/:ticketId')
  @UserPermission() // tạm thời để thế này trước
  async listByTicket(
    @External() { oid }: TExternal,
    @Param('ticketId') ticketId: string
  ): Promise<BaseResponse> {
    const data = await this.paymentService.listByTicketId(oid, ticketId)
    return { data }
  }

  @Post('update-info/:id')
  @UserPermission(PermissionId.PAYMENT_UPDATE_INFO)
  async moneyOutUpdateInfo(
    @External() { oid, user }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: PaymentUpdateInfoBody
  ): Promise<BaseResponse> {
    const data = await this.paymentService.updateInfo({
      oid,
      paymentId: id,
      body,
      userId: user.id,
    })
    return { data }
  }

  @Post('other/create-money-out')
  @UserPermission(PermissionId.PAYMENT_OTHER_CREATE_MONEY_OUT)
  async otherCreateMoneyOut(
    @External() { oid, user }: TExternal,
    @Body() body: OtherPaymentBody
  ): Promise<BaseResponse> {
    const data = await this.paymentService.createMoneyOut({
      oid,
      body,
      userId: user.id,
    })
    return { data }
  }

  @Post('other/create-money-in')
  @UserPermission(PermissionId.PAYMENT_OTHER_CREATE_MONEY_IN)
  async moneyInCreateOther(
    @External() { oid, user }: TExternal,
    @Body() body: OtherPaymentBody
  ): Promise<BaseResponse> {
    const data = await this.paymentService.createMoneyIn({
      oid,
      body,
      userId: user.id,
    })
    return { data }
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.PAYMENT_DESTROY)
  async destroy(
    @External() { oid, user }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
    const data = await this.paymentService.destroy({
      oid,
      paymentId: id,
      userId: user.id,
    })
    return { data }
  }
}
