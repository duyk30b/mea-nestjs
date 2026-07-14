import { ConditionNumber } from '@libs/common/dto'
import { SortQuery } from '@libs/common/dto/query'
import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'

export class PermissionRelationQuery { }

export class PermissionFilterQuery {
  @Expose()
  @Type(() => ConditionNumber)
  @ValidateNested({ each: true })
  level: ConditionNumber

  @Expose()
  @Type(() => ConditionNumber)
  @ValidateNested({ each: true })
  rootId: ConditionNumber
}

export class PermissionSortQuery extends SortQuery { }
