import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsIn } from 'class-validator'
import { StatisticTimeQuery } from './statistic-time.query'

export class StatisticTopCustomerBestVisitQuery extends StatisticTimeQuery {
  @ApiPropertyOptional({
    enum: ['sumTotalMoney', 'sumProfit', 'countVisit'],
    example: 'sumTotalMoney',
  })
  @Expose()
  @IsIn(['sumTotalMoney', 'sumProfit', 'countVisit'])
  orderBy: 'sumTotalMoney' | 'sumProfit' | 'countVisit'
}
