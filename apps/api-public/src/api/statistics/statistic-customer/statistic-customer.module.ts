import { Module } from '@nestjs/common'
import { StatisticCustomerController } from './statistic-customer.controller'
import { StatisticCustomerService } from './statistic-customer.service'

@Module({
  imports: [],
  controllers: [StatisticCustomerController],
  providers: [StatisticCustomerService],
})
export class StatisticCustomerModule { }
