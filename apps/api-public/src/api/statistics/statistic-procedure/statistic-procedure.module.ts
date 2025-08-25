import { Module } from '@nestjs/common'
import {
  StatisticProcedureController,
} from './statistic-procedure.controller'
import { StatisticProcedureService } from './statistic-procedure.service'

@Module({
  imports: [],
  controllers: [StatisticProcedureController],
  providers: [StatisticProcedureService],
})
export class StatisticProcedureModule { }
