import { Expose, Type } from 'class-transformer'
import { IsIn, IsOptional, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto/condition-timestamp'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class RoleRelationQuery {
  @Expose()
  @IsOptional()
  userRoleList: { user?: boolean; role?: boolean } | false
}

export class RoleFilterQuery {
  @Expose()
  @IsIn([0, 1])
  isActive: 0 | 1

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class RoleSortQuery extends SortQuery { }
