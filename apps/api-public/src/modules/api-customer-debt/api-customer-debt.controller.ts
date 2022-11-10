import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { OrganizationId } from '../../decorators/request.decorator'
import { ApiCustomerDebtService } from './api-customer-debt.service'
import { CustomerDebtPaginationQuery, CustomerDebtPaymentBody } from './request'

@ApiTags('Customer Debt')
@ApiBearerAuth('access-token')
@Controller('customer-debt')
export class ApiCustomerDebtController {
	constructor(private readonly apiCustomerDebtService: ApiCustomerDebtService) { }

	@Get('pagination')
	pagination(@OrganizationId() oid: number, @Query() query: CustomerDebtPaginationQuery) {
		return this.apiCustomerDebtService.pagination(oid, query)
	}

	@Post('payment')
	startPayDebt(@OrganizationId() oid: number, @Body() body: CustomerDebtPaymentBody) {
		return this.apiCustomerDebtService.startPayDebt(oid, body)
	}
}
