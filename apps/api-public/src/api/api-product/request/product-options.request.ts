import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, ValidateNested } from 'class-validator'
import { ConditionString } from '../../../../../_libs/common/dto'
import { ConditionNumber } from '../../../../../_libs/common/dto/condition-number'
import { ConditionTimestamp } from '../../../../../_libs/common/dto/condition-timestamp'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class ProductRelationQuery {
  @Expose()
  @IsBoolean()
  batchList: boolean

  @Expose()
  @IsBoolean()
  productGroup: boolean

  @Expose()
  @IsBoolean()
  positionList: boolean

  @Expose()
  @IsBoolean()
  discountList: boolean
}

export class BatchFilterQuery {
  @Expose()
  @Type(() => ConditionNumber)
  @ValidateNested({ each: true })
  quantity: ConditionNumber

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  expiryDate: ConditionTimestamp
}

export class ProductFilterQuery {
  @Expose()
  @IsNumber()
  productGroupId: number

  @Expose()
  @Type(() => ConditionString)
  @ValidateNested({ each: true })
  brandName: ConditionString

  @Expose()
  @Type(() => ConditionString)
  @ValidateNested({ each: true })
  substance: ConditionString

  @Expose()
  @IsIn([0, 1])
  isActive: 0 | 1

  @Expose()
  @Type(() => ConditionNumber)
  @ValidateNested({ each: true })
  quantity: ConditionNumber

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp

  @Expose()
  @Type(() => ProductFilterQuery)
  @ValidateNested({ each: true })
  $OR: ProductFilterQuery[]
}

export class ProductFilterQueryFull extends ProductFilterQuery {
  @Expose()
  @Type(() => BatchFilterQuery)
  @ValidateNested({ each: true })
  batchList: BatchFilterQuery
}

export class ProductSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  brandName: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  quantity: 'ASC' | 'DESC'
}
