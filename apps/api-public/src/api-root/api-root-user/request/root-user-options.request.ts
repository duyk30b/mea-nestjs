import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class RootUserRelationQuery {
  @Expose()
  @IsBoolean()
  organization: boolean

  @Expose()
  @IsOptional()
  userRoleList: { user?: boolean; role?: boolean } | false
}

export class RootUserFilterQuery {
  @Expose()
  @IsNumber()
  oid: number

  @Expose()
  @IsIn([0, 1])
  isAdmin: 0 | 1

  @Expose()
  @IsIn([0, 1])
  isActive: 0 | 1

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class RootUserSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  oid: 'ASC' | 'DESC'
}
