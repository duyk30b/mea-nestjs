import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsOptional, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class TicketLaboratoryRelationQuery {
  @Expose()
  @IsOptional()
  laboratoryList: boolean

  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  ticketUserList: boolean

  @Expose()
  @IsBoolean()
  ticket: boolean
}

export class TicketLaboratoryFilterQuery {
  @Expose()
  @IsInt()
  laboratoryId: number

  @Expose()
  @IsInt()
  customerId: number

  @Expose()
  @IsInt()
  ticketId: number

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  startedAt: ConditionTimestamp
}

export class TicketLaboratorySortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  startedAt: 'ASC' | 'DESC'
}
