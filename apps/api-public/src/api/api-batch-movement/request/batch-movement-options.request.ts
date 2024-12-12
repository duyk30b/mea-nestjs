import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional } from 'class-validator'
import { ConditionNumber, transformConditionNumber } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { MovementType } from '../../../../../_libs/database/common/variable'

export class BatchMovementRelationQuery {
  @Expose()
  @IsBoolean()
  product: boolean

  @Expose()
  @IsBoolean()
  batch: boolean

  @Expose()
  @IsBoolean()
  receipt: boolean

  @Expose()
  @IsBoolean()
  ticket: boolean

  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  distributor: boolean

  @Expose()
  @IsBoolean()
  user: boolean
}
export class BatchMovementFilterQuery {
  @Expose()
  @IsNumber()
  productId: number

  @Expose()
  @IsNumber()
  batchId: number

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  voucherId: number | ConditionNumber

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  contactId: number | ConditionNumber

  @Expose()
  @IsEnumValue(MovementType)
  movementType: MovementType
}

export class BatchMovementSortQuery extends SortQuery { }
