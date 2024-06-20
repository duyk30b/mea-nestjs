import { Expose, Transform, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionNumber,
  ConditionTimestamp,
  transformConditionNumber,
} from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class BatchRelationQuery {
  @Expose()
  @IsBoolean()
  product: boolean
}
export class BatchFilterQuery {
  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  productId: number | ConditionNumber

  @Expose()
  @Type(() => ConditionNumber)
  @ValidateNested({ each: true })
  quantity: ConditionNumber

  @Expose()
  @IsIn([0, 1])
  isActive: 0 | 1

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  expiryDate: ConditionTimestamp

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class BatchSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  expiryDate: 'ASC' | 'DESC'
}
