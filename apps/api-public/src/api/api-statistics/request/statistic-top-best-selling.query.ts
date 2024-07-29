import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsIn } from 'class-validator'
import { StatisticTimeQuery } from './statistic-time.query'

export class StatisticTopBestSellingQuery extends StatisticTimeQuery {
  @ApiPropertyOptional({
    enum: ['sumActualMoney', 'sumProfit', 'sumQuantity'],
    example: 'sumQuantity',
  })
  @Expose()
  @IsIn(['sumActualMoney', 'sumQuantity', 'sumProfit'])
  orderBy: 'sumActualMoney' | 'sumQuantity'
}
