import { ConditionTimestamp } from '@libs/common/dto/condition-timestamp'
import { SortQuery } from '@libs/common/dto/query'
import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'

export class ProductGroupRelationQuery { }
export class ProductGroupFilterQuery {
  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class ProductGroupSortQuery extends SortQuery { }
