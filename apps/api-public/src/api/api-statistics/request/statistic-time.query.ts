import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDate, IsDefined, IsIn } from 'class-validator'
import { LimitQuery } from '../../../../../_libs/common/dto/query'

export class StatisticTimeQuery extends LimitQuery {
  @ApiProperty()
  @Expose()
  @Type(() => Date)
  @IsDefined()
  @IsDate()
  fromTime: Date

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  @IsDefined()
  @IsDate()
  toTime: Date

  @ApiPropertyOptional()
  @Expose()
  @IsIn(['date', 'month'])
  timeType: 'date' | 'month'
}
