import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto/condition-timestamp'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class ProductGroupRelationQuery { }
export class ProductGroupFilterQuery {
  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class ProductGroupSortQuery extends SortQuery { }
