import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { OrganizationId } from '../../decorators/request.decorator'
import { ApiStatisticsService } from './api-statistics.service'
import { StatisticsRevenueMonthQuery } from './request/statistics-revenue.query'

@ApiTags('Statistics')
@ApiBearerAuth('access-token')
@Controller('statistics')
export class ApiStatisticsController {
	constructor(private readonly apiStatisticsService: ApiStatisticsService) { }

	@Get('revenue-month')
	revenueMonth(@OrganizationId() oid: number, @Query() query: StatisticsRevenueMonthQuery) {
		return this.apiStatisticsService.revenueMonth(oid, query.year, query.month)
	}
}
