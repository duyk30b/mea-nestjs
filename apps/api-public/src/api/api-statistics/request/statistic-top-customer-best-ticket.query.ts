import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsIn } from 'class-validator'
import { StatisticTimeQuery } from './statistic-time.query'

export class StatisticTopCustomerBestTicketQuery extends StatisticTimeQuery {
  @ApiPropertyOptional({
    enum: ['sumTotalMoney', 'sumProfit', 'countTicket'],
    example: 'sumTotalMoney',
  })
  @Expose()
  @IsIn(['sumTotalMoney', 'sumProfit', 'countTicket'])
  orderBy: 'sumTotalMoney' | 'sumProfit' | 'countTicket'
}
