import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../common/request-external'
import { ApiDistributorDebtService } from './api-distributor-debt.service'
import { DistributorDebtPaginationQuery, DistributorDebtPaymentBody } from './request'

@ApiTags('Distributor Debt')
@ApiBearerAuth('access-token')
@Controller('distributor-debt')
export class ApiDistributorDebtController {
	constructor(private readonly apiDistributorDebtService: ApiDistributorDebtService) { }

	@Get('pagination')
	pagination(@External() { oid }: TExternal, @Query() query: DistributorDebtPaginationQuery) {
		return this.apiDistributorDebtService.pagination(oid, query)
	}

	@Post('payment')
	startPayDebt(@External() { oid }: TExternal, @Body() body: DistributorDebtPaymentBody) {
		return this.apiDistributorDebtService.startPayDebt(oid, body)
	}
}
