import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../common/request-external'
import { ApiStatisticsService } from './api-statistics.service'
import { StatisticsRevenueMonthQuery } from './request/statistics-revenue.query'

@ApiTags('Statistics')
@ApiBearerAuth('access-token')
@Controller('statistics')
export class ApiStatisticsController {
	constructor(private readonly apiStatisticsService: ApiStatisticsService) { }

	@Get('revenue-month')
	revenueMonth(@External() { oid }: TExternal, @Query() query: StatisticsRevenueMonthQuery) {
		return this.apiStatisticsService.revenueMonth(oid, query.year, query.month)
	}
}
