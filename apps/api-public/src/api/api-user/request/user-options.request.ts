import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto/condition-timestamp'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class UserRelationQuery {
  @Expose()
  @IsBoolean()
  organization: boolean

  @Expose()
  @IsBoolean()
  userRoleList: boolean
}

export class UserFilterQuery {
  @Expose()
  @IsNotEmpty()
  @IsString()
  searchText: string

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

export class UserSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  phone: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  username: 'ASC' | 'DESC'
}
