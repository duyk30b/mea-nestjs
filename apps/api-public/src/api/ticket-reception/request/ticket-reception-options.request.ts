import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, ValidateNested } from 'class-validator'
import {
  ConditionTimestamp,
  SortQuery,
} from '../../../../../_libs/common/dto'

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

  @Expose()
  @IsBoolean()
  customerSource?: boolean
}

export class TicketReceptionFilterQuery {
  @Expose()
  @IsNumber()
  ticketId: string

  @Expose()
  @IsNumber()
  roomId: number

  @Expose()
  @IsNumber()
  customerId: number

  @Expose()
  @IsNumber()
  customerSourceId: number

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
