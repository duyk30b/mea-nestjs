import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { ConditionNumber } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'

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
