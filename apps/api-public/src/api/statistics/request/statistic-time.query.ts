import { LimitQuery } from '@libs/common/dto/query'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDate, IsIn } from 'class-validator'

export class StatisticTimeQuery extends LimitQuery {
  @ApiProperty()
  @Expose()
  @Type(() => Date)
  @IsDate()
  fromTime: Date

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  @IsDate()
  toTime: Date

  @ApiPropertyOptional()
  @Expose()
  @IsIn(['date', 'month'])
  timeType: 'date' | 'month'
}
