import { Expose, Type } from 'class-transformer'
import { IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { ConditionNumber } from '../../../../../_libs/common/dto/condition-number'
import { ConditionTimestamp } from '../../../../../_libs/common/dto/condition-timestamp'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class DistributorRelationQuery {}
export class DistributorFilterQuery {
  @Expose()
  @IsIn([0, 1])
  isActive: 0 | 1

  @Expose()
  @IsNotEmpty()
  @IsString()
  searchText?: string

  @Expose()
  @Type(() => ConditionNumber)
  @ValidateNested({ each: true })
  debt: ConditionNumber

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class DistributorSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  debt: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  fullName: 'ASC' | 'DESC'
}
