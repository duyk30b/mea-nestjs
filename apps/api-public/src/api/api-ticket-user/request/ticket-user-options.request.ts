import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsString, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class TicketUserRelationQuery {
  @Expose()
  @IsBoolean()
  user: boolean

  @Expose()
  @IsBoolean()
  role: boolean

  @Expose()
  @IsBoolean()
  position: boolean

  @Expose()
  @IsBoolean()
  ticket: boolean

  @Expose()
  @IsBoolean()
  product: boolean

  @Expose()
  @IsBoolean()
  procedure: boolean

  @Expose()
  @IsBoolean()
  regimen: boolean

  @Expose()
  @IsBoolean()
  laboratory: boolean

  @Expose()
  @IsBoolean()
  laboratoryGroup: boolean

  @Expose()
  @IsBoolean()
  radiology: boolean
}

export class TicketUserFilterQuery {
  @Expose()
  @IsString()
  ticketId: string

  @Expose()
  @IsInt()
  userId: number

  @Expose()
  @IsInt()
  roleId: number

  @Expose()
  @IsInt()
  positionId: number

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt?: ConditionTimestamp
}

export class TicketUserSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  createdAt: 'ASC' | 'DESC'
}
