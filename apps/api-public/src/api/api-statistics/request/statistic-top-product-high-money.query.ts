import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsIn } from 'class-validator'
import { LimitQuery } from '../../../../../_libs/common/dto'

export class StatisticProductHighMoneyQuery extends LimitQuery {
  @ApiPropertyOptional({
    enum: ['quantity', 'costAmount', 'sumRetailMoney'],
    example: 'costAmount',
  })
  @Expose()
  @IsIn(['quantity', 'costAmount', 'sumRetailMoney'])
  orderBy: 'quantity' | 'costAmount' | 'sumRetailMoney'
}
