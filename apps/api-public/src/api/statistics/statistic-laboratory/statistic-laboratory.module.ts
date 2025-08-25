import { Module } from '@nestjs/common'
import { StatisticLaboratoryController } from './statistic-laboratory.controller'
import { StatisticLaboratoryService } from './statistic-laboratory.service'

@Module({
  imports: [],
  controllers: [StatisticLaboratoryController],
  providers: [StatisticLaboratoryService],
})
export class StatisticLaboratoryModule { }
