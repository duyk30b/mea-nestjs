import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiPaymentService } from './api-payment.service'
import {
  CustomerPaymentBody,
  DistributorPaymentBody,
  OtherPaymentBody,
  PaymentGetManyQuery,
  PaymentPaginationQuery,
} from './request'

@ApiTags('Payment')
@ApiBearerAuth('access-token')
@Controller('payment')
export class ApiPaymentController {
  constructor(private readonly apiPaymentService: ApiPaymentService) { }

  @Get('pagination')
  @IsUser() // tạm thời để thế này trước
  pagination(@External() { oid }: TExternal, @Query() query: PaymentPaginationQuery) {
    return this.apiPaymentService.pagination(oid, query)
  }

  @Get('list')
  @IsUser() // tạm thời để thế này trước
  async list(@External() { oid }: TExternal, @Query() query: PaymentGetManyQuery) {
    return await this.apiPaymentService.getMany(oid, query)
  }

  @Get('sum-money')
  @IsUser() // tạm thời để thế này trước
  async sumMoney(@External() { oid }: TExternal, @Query() query: PaymentGetManyQuery) {
    return await this.apiPaymentService.sumMoney(oid, query)
  }

  @Post('customer-money-in')
  @HasPermission(PermissionId.PAYMENT_CUSTOMER_MONEY_IN)
  customerPaymentMoneyIn(@External() { oid }: TExternal, @Body() body: CustomerPaymentBody) {
    return this.apiPaymentService.customerPaymentMoneyIn(oid, body)
  }

  @Post('distributor-money-out')
  @HasPermission(PermissionId.PAYMENT_DISTRIBUTOR_MONEY_OUT)
  distributorPaymentMoneyOut(@External() { oid }: TExternal, @Body() body: DistributorPaymentBody) {
    return this.apiPaymentService.distributorPaymentMoneyOut(oid, body)
  }

  @Post('other-money-in')
  @HasPermission(PermissionId.PAYMENT_OTHER_MONEY_IN)
  otherPaymentMoneyIn(@External() { oid, user }: TExternal, @Body() body: OtherPaymentBody) {
    return this.apiPaymentService.otherPaymentMoneyIn({ oid, body, userId: user.id })
  }

  @Post('other-money-out')
  @HasPermission(PermissionId.PAYMENT_OTHER_MONEY_OUT)
  otherPaymentMoneyOut(@External() { oid, user }: TExternal, @Body() body: OtherPaymentBody) {
    return this.apiPaymentService.otherPaymentMoneyOut({ oid, body, userId: user.id })
  }
}
