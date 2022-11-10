import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { OrganizationId } from '../../decorators/request.decorator'
import { ApiDistributorDebtService } from './api-distributor-debt.service'
import { DistributorDebtPaginationQuery, DistributorDebtPaymentBody } from './request'

@ApiTags('Distributor Debt')
@ApiBearerAuth('access-token')
@Controller('distributor-debt')
export class ApiDistributorDebtController {
	constructor(private readonly apiDistributorDebtService: ApiDistributorDebtService) { }

	@Get('pagination')
	pagination(@OrganizationId() oid: number, @Query() query: DistributorDebtPaginationQuery) {
		return this.apiDistributorDebtService.pagination(oid, query)
	}

	@Post('payment')
	startPayDebt(@OrganizationId() oid: number, @Body() body: DistributorDebtPaymentBody) {
		return this.apiDistributorDebtService.startPayDebt(oid, body)
	}
}
