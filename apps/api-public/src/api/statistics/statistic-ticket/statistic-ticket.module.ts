import { Module } from '@nestjs/common'
import {
  StatisticTicketController,
} from './statistic-ticket.controller'
import { StatisticTicketService } from './statistic-ticket.service'

@Module({
  imports: [],
  controllers: [StatisticTicketController],
  providers: [StatisticTicketService],
})
export class StatisticTicketModule { }
