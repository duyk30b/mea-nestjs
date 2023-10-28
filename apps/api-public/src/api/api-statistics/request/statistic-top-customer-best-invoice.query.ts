import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsIn } from 'class-validator'
import { StatisticTimeQuery } from './statistic-time.query'

export class StatisticTopCustomerBestInvoiceQuery extends StatisticTimeQuery {
  @ApiPropertyOptional({
    enum: ['sumRevenue', 'sumProfit', 'countInvoice'],
    example: 'sumRevenue',
  })
  @Expose()
  @IsIn(['sumRevenue', 'sumProfit', 'countInvoice'])
  orderBy: 'sumRevenue' | 'sumProfit' | 'countInvoice'
}
