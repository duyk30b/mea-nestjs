import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsIn } from 'class-validator'
import { StatisticTimeQuery } from './statistic-time.query'

export class StatisticTopCustomerBestInvoiceQuery extends StatisticTimeQuery {
  @ApiPropertyOptional({
    enum: ['sumTotalMoney', 'sumProfit', 'countInvoice'],
    example: 'sumTotalMoney',
  })
  @Expose()
  @IsIn(['sumTotalMoney', 'sumProfit', 'countInvoice'])
  orderBy: 'sumTotalMoney' | 'sumProfit' | 'countInvoice'
}
