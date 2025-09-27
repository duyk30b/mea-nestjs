import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GenerateIdParam, IdParam } from '../../../../_libs/common/dto'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiPaymentService } from './api-payment.service'
import { PaymentOtherService } from './payment-other.service'
import {
  OtherPaymentBody,
  PaymentGetManyQuery,
  PaymentPaginationQuery,
  PaymentUpdateInfoBody,
} from './request'

@ApiTags('Payment')
@ApiBearerAuth('access-token')
@Controller('payment')
export class ApiPaymentController {
  constructor(
    private readonly apiPaymentService: ApiPaymentService,
    private readonly paymentOtherService: PaymentOtherService
  ) { }

  @Get('pagination')
  @UserPermission() // tạm thời để thế này trước
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: PaymentPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPaymentService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission() // tạm thời để thế này trước
  async list(
    @External() { oid }: TExternal,
    @Query() query: PaymentGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPaymentService.getMany(oid, query)
    return { data }
  }

  @Post('update-info/:id')
  @UserPermission(PermissionId.PAYMENT_UPDATE_INFO)
  async moneyOutUpdateInfo(
    @External() { oid, user }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: PaymentUpdateInfoBody
  ): Promise<BaseResponse> {
    const data = await this.apiPaymentService.updateInfo({
      oid,
      paymentId: id,
      body,
      userId: user.id,
    })
    return { data }
  }

  @Get('sum-money')
  @UserPermission() // tạm thời để thế này trước
  async sumMoney(
    @External() { oid }: TExternal,
    @Query() query: PaymentGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPaymentService.sumMoney(oid, query)
    return { data }
  }

  @Post('other/create-money-out')
  @UserPermission(PermissionId.PAYMENT_OTHER_CREATE_MONEY_OUT)
  async otherCreateMoneyOut(
    @External() { oid, user }: TExternal,
    @Body() body: OtherPaymentBody
  ): Promise<BaseResponse> {
    const data = await this.paymentOtherService.createMoneyOut({
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
    const data = await this.paymentOtherService.createMoneyIn({
      oid,
      body,
      userId: user.id,
    })
    return { data }
  }

  @Post('other/destroy-money-out/:id')
  @UserPermission(PermissionId.PAYMENT_OTHER_DESTROY_MONEY_OUT)
  async moneyOutDestroyOther(
    @External() { oid, user }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
    const data = await this.paymentOtherService.destroyMoneyOut({
      oid,
      paymentId: id,
      userId: user.id,
    })
    return { data }
  }

  @Post('other/destroy-money-in/:id')
  @UserPermission(PermissionId.PAYMENT_OTHER_DESTROY_MONEY_IN)
  async moneyInDestroyOther(
    @External() { oid, user }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
    const data = await this.paymentOtherService.destroyMoneyIn({
      oid,
      paymentId: id,
      userId: user.id,
    })
    return { data }
  }
}
