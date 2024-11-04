import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto/condition-timestamp'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class RadiologyGroupRelationQuery { }
export class RadiologyGroupFilterQuery {
  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class RadiologyGroupSortQuery extends SortQuery { }
