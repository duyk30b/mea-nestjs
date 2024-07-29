import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiCustomerPaymentService } from './api-customer-payment.service'
import {
  CustomerPaymentGetManyQuery,
  CustomerPaymentPaginationQuery,
  CustomerPaymentPayDebtBody,
} from './request'

@ApiTags('Customer Payment')
@ApiBearerAuth('access-token')
@Controller('customer-payment')
export class ApiCustomerPaymentController {
  constructor(private readonly apiCustomerPaymentService: ApiCustomerPaymentService) {}

  @Get('pagination')
  @HasPermission(PermissionId.CUSTOMER_PAYMENT_READ)
  pagination(@External() { oid }: TExternal, @Query() query: CustomerPaymentPaginationQuery) {
    return this.apiCustomerPaymentService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.CUSTOMER_PAYMENT_READ)
  async list(@External() { oid }: TExternal, @Query() query: CustomerPaymentGetManyQuery) {
    return await this.apiCustomerPaymentService.getMany(oid, query)
  }

  @Post('pay-debt')
  @HasPermission(PermissionId.CUSTOMER_PAY_DEBT)
  startPayDebt(@External() { oid }: TExternal, @Body() body: CustomerPaymentPayDebtBody) {
    return this.apiCustomerPaymentService.startPayDebt(oid, body)
  }
}
