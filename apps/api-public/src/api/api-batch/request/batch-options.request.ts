import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsIn, IsOptional, ValidateNested } from 'class-validator'
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
  id: number | ConditionNumber

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  warehouseId: number | ConditionNumber

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  distributorId: number | ConditionNumber

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  productId: number | ConditionNumber

  @Expose()
  @Type(() => ConditionNumber)
  @ValidateNested({ each: true })
  quantity: ConditionNumber

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  expiryDate: ConditionTimestamp

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  registeredAt: ConditionTimestamp

  @Expose()
  @Type(() => BatchFilterQuery)
  @IsArray()
  @ValidateNested({ each: true })
  $OR: BatchFilterQuery[]
}

export class BatchSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  expiryDate: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  registeredAt: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  productId: 'ASC' | 'DESC'
}
