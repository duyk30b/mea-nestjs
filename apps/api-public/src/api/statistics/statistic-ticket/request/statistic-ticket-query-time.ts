import { ApiProperty, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDate, IsDefined, IsIn } from 'class-validator'
import { TicketGetQuery } from '../../../ticket/ticket-query/request'

export class StatisticTicketQueryTime extends PickType(TicketGetQuery, ['filter']) {
  @ApiProperty()
  @Expose()
  @IsIn(['date', 'month'])
  groupTimeType: 'date' | 'month'

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
}