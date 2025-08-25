import { Module } from '@nestjs/common'
import {
  StatisticProductController,
} from './statistic-product.controller'
import { StatisticProductService } from './statistic-product.service'

@Module({
  imports: [],
  controllers: [StatisticProductController],
  providers: [StatisticProductService],
})
export class StatisticProductModule { }
