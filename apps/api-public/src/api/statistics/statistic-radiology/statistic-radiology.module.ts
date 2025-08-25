import { Module } from '@nestjs/common'
import { StatisticRadiologyController } from './statistic-radiology.controller'
import { StatisticRadiologyService } from './statistic-radiology.service'

@Module({
  imports: [],
  controllers: [StatisticRadiologyController],
  providers: [StatisticRadiologyService],
})
export class StatisticRadiologyModule { }
