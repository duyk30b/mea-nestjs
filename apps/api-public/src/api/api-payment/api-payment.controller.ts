import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiPaymentService } from './api-payment.service'
import { PaymentActionService } from './payment-action.service'
import {
  CustomerPaymentBody,
  DistributorPaymentBody,
  DistributorRefundBody,
  OtherPaymentBody,
  PaymentGetManyQuery,
  PaymentPaginationQuery,
  PaymentPostQuery,
} from './request'
import { CustomerRefundBody } from './request/customer-refund.body'

@ApiTags('Payment')
@ApiBearerAuth('access-token')
@Controller('payment')
export class ApiPaymentController {
  constructor(
    private readonly apiPaymentService: ApiPaymentService,
    private readonly paymentActionService: PaymentActionService
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

  @Get('sum-money')
  @UserPermission() // tạm thời để thế này trước
  async sumMoney(
    @External() { oid }: TExternal,
    @Query() query: PaymentGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.sumMoney(oid, query)
    return { data }
  }

  @Post('customer-payment')
  @UserPermission(PermissionId.PAYMENT_CUSTOMER_PAYMENT)
  async customerPayment(
    @External() { oid, uid }: TExternal,
    @Body() body: CustomerPaymentBody,
    @Query() query: PaymentPostQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.customerPayment({ oid, userId: uid, body, query })
    return { data }
  }

  @Post('customer-refund')
  @UserPermission(PermissionId.PAYMENT_CUSTOMER_REFUND)
  async customerRefund(
    @External() { oid, uid }: TExternal,
    @Body() body: CustomerRefundBody
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.customerRefund({ oid, userId: uid, body })
    return { data }
  }

  @Post('distributor-payment')
  @UserPermission(PermissionId.PAYMENT_DISTRIBUTOR_PAYMENT)
  async distributorPayment(
    @External() { oid, uid }: TExternal,
    @Body() body: DistributorPaymentBody
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.distributorPayment({ oid, userId: uid, body })
    return { data }
  }

  @Post('distributor-refund')
  @UserPermission(PermissionId.PAYMENT_DISTRIBUTOR_REFUND)
  async distributorRefund(
    @External() { oid, uid }: TExternal,
    @Body() body: DistributorRefundBody
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.distributorRefund({ oid, userId: uid, body })
    return { data }
  }

  @Post('other-money-in')
  @UserPermission(PermissionId.PAYMENT_OTHER_MONEY_IN)
  async otherPaymentMoneyIn(
    @External() { oid, user }: TExternal,
    @Body() body: OtherPaymentBody
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.otherPaymentMoneyIn({ oid, body, userId: user.id })
    return { data }
  }

  @Post('other-money-out')
  @UserPermission(PermissionId.PAYMENT_OTHER_MONEY_OUT)
  async otherPaymentMoneyOut(
    @External() { oid, user }: TExternal,
    @Body() body: OtherPaymentBody
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.otherPaymentMoneyOut({
      oid,
      body,
      userId: user.id,
    })
    return { data }
  }
}
