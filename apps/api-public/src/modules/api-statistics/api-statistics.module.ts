import { Module } from '@nestjs/common'
import { ApiStatisticsController } from './api-statistics.controller'
import { ApiStatisticsService } from './api-statistics.service'

@Module({
	imports: [],
	controllers: [ApiStatisticsController],
	providers: [ApiStatisticsService],
})
export class ApiStatisticsModule { }
