import {
  ConditionTimestamp,
  SortQuery,
} from '@libs/common/dto'
import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsString, ValidateNested } from 'class-validator'

export class TicketReceptionRelationQuery {
  @Expose()
  @IsBoolean()
  ticket?: boolean

  @Expose()
  @IsBoolean()
  room?: boolean

  @Expose()
  @IsBoolean()
  customer?: boolean
}

export class TicketReceptionFilterQuery {
  @Expose()
  @IsString()
  ticketId: string

  @Expose()
  @IsNumber()
  roomId: number

  @Expose()
  @IsNumber()
  customerId: number

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  receptionAt: ConditionTimestamp
}

export class TicketReceptionSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  receptionAt: 'ASC' | 'DESC'
}
