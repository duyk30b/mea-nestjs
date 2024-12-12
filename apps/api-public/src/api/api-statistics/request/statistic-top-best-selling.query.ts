import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsIn } from 'class-validator'
import { StatisticTimeQuery } from './statistic-time.query'

export class StatisticTopBestSellingQuery extends StatisticTimeQuery {
  @ApiPropertyOptional({
    enum: ['sumActualAmount', 'sumProfitAmount', 'sumQuantity'],
    example: 'sumQuantity',
  })
  @Expose()
  @IsIn(['sumActualAmount', 'sumQuantity', 'sumProfitAmount'])
  orderBy: 'sumActualAmount' | 'sumQuantity'
}
