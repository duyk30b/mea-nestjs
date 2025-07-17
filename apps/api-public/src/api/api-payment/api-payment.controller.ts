import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiPaymentActionService } from './api-payment-action.service'
import { ApiPaymentService } from './api-payment.service'
import {
  CustomerPaymentBody,
  CustomerPaymentCommonBody,
  DistributorPaymentBody,
  OtherPaymentBody,
  PaymentGetManyQuery,
  PaymentPaginationQuery,
} from './request'

@ApiTags('Payment')
@ApiBearerAuth('access-token')
@Controller('payment')
export class ApiPaymentController {
  constructor(
    private readonly apiPaymentService: ApiPaymentService,
    private readonly apiPaymentActionService: ApiPaymentActionService
  ) { }

  @Get('pagination')
  @UserPermission() // tạm thời để thế này trước
  pagination(@External() { oid }: TExternal, @Query() query: PaymentPaginationQuery) {
    return this.apiPaymentService.pagination(oid, query)
  }

  @Get('list')
  @UserPermission() // tạm thời để thế này trước
  async list(@External() { oid }: TExternal, @Query() query: PaymentGetManyQuery) {
    return await this.apiPaymentService.getMany(oid, query)
  }

  @Get('sum-money')
  @UserPermission() // tạm thời để thế này trước
  async sumMoney(@External() { oid }: TExternal, @Query() query: PaymentGetManyQuery) {
    return await this.apiPaymentService.sumMoney(oid, query)
  }

  @Post('customer-money-in')
  @UserPermission(PermissionId.PAYMENT_CUSTOMER_MONEY_IN)
  customerPaymentMoneyIn(@External() { oid }: TExternal, @Body() body: CustomerPaymentBody) {
    return this.apiPaymentActionService.customerPaymentMoneyIn(oid, body)
  }

  @Post('customer-payment-common')
  @UserPermission(PermissionId.PAYMENT_CUSTOMER_MONEY_IN)
  customerPaymentCommon(@External() { oid }: TExternal, @Body() body: CustomerPaymentCommonBody) {
    return this.apiPaymentActionService.customerPaymentCommon(oid, body)
  }

  V

  @Post('distributor-money-out')
  @UserPermission(PermissionId.PAYMENT_DISTRIBUTOR_MONEY_OUT)
  distributorPaymentMoneyOut(@External() { oid }: TExternal, @Body() body: DistributorPaymentBody) {
    return this.apiPaymentActionService.distributorPaymentMoneyOut(oid, body)
  }

  @Post('other-money-in')
  @UserPermission(PermissionId.PAYMENT_OTHER_MONEY_IN)
  otherPaymentMoneyIn(@External() { oid, user }: TExternal, @Body() body: OtherPaymentBody) {
    return this.apiPaymentActionService.otherPaymentMoneyIn({ oid, body, userId: user.id })
  }

  @Post('other-money-out')
  @UserPermission(PermissionId.PAYMENT_OTHER_MONEY_OUT)
  otherPaymentMoneyOut(@External() { oid, user }: TExternal, @Body() body: OtherPaymentBody) {
    return this.apiPaymentActionService.otherPaymentMoneyOut({ oid, body, userId: user.id })
  }
}
