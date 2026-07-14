import { LimitQuery } from '@libs/common/dto'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsIn } from 'class-validator'

export class StatisticProductHighMoneyQuery extends LimitQuery {
  @ApiPropertyOptional({
    enum: ['quantity', 'costAmount', 'retailAmount'],
    example: 'costAmount',
  })
  @Expose()
  @IsIn(['quantity', 'costAmount', 'retailAmount'])
  orderBy: 'quantity' | 'costAmount' | 'retailAmount'
}
