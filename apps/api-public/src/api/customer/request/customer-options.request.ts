import { ConditionNumber } from '@libs/common/dto/condition-number'
import { ConditionTimestamp } from '@libs/common/dto/condition-timestamp'
import { SortQuery } from '@libs/common/dto/query'
import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator'

export class CustomerRelationQuery {
  @Expose()
  @IsBoolean()
  customerGroup?: boolean

  @Expose()
  @IsBoolean()
  customerSource?: boolean
}

export class CustomerFilterQuery {
  @Expose()
  @IsIn([0, 1])
  isActive?: 0 | 1

  @Expose()
  @IsNotEmpty()
  @IsString()
  searchText?: string

  @Expose()
  @Type(() => ConditionNumber)
  @ValidateNested({ each: true })
  debt?: ConditionNumber

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt?: ConditionTimestamp
}

export class CustomerSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  customerCode?: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  debt?: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  fullName?: 'ASC' | 'DESC'
}
