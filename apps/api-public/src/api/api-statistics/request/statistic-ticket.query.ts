import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { TicketType } from '../../../../../_libs/database/entities/ticket.entity'
import { StatisticTimeQuery } from './statistic-time.query'

export class StatisticTicketQuery extends StatisticTimeQuery {
  @ApiPropertyOptional()
  @Expose()
  @Type(() => Number)
  @IsEnumValue(TicketType)
  ticketType: TicketType
}
