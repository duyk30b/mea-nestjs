import { Module } from '@nestjs/common'
import { ApiStatisticController } from './api-statistic.controller'
import { ApiStatisticService } from './api-statistic.service'

@Module({
  imports: [],
  controllers: [ApiStatisticController],
  providers: [ApiStatisticService],
})
export class ApiStatisticModule {}
