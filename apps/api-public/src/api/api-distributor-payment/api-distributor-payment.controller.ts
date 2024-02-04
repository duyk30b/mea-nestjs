import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiDistributorPaymentService } from './api-distributor-payment.service'
import { DistributorPaymentPaginationQuery, DistributorPaymentPayDebtBody } from './request'

@ApiTags('Distributor Debt')
@ApiBearerAuth('access-token')
@Controller('distributor-payment')
export class ApiDistributorPaymentController {
  constructor(private readonly apiDistributorPaymentService: ApiDistributorPaymentService) {}

  @Get('pagination')
  pagination(@External() { oid }: TExternal, @Query() query: DistributorPaymentPaginationQuery) {
    return this.apiDistributorPaymentService.pagination(oid, query)
  }

  @Post('pay-debt')
  startPayDebt(@External() { oid }: TExternal, @Body() body: DistributorPaymentPayDebtBody) {
    return this.apiDistributorPaymentService.startPayDebt(oid, body)
  }
}
