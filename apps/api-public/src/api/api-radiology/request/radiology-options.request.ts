import { Expose, Type } from 'class-transformer'
import { IsIn, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class RadiologyRelationQuery {}

export class RadiologyFilterQuery {
  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class RadiologySortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  name: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  price: 'ASC' | 'DESC'
}
