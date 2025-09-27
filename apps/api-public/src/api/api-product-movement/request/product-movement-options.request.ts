import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional } from 'class-validator'
import {
  ConditionNumber,
  ConditionString,
  SortQuery,
  createConditionEnum,
  transformConditionEnum,
  transformConditionNumber,
} from '../../../../../_libs/common/dto'
import { MovementType } from '../../../../../_libs/database/common/variable'

const ConditionEnumMovementType = createConditionEnum(MovementType)

export class ProductMovementRelationQuery {
  @Expose()
  @IsBoolean()
  product: boolean

  @Expose()
  @IsBoolean()
  purchaseOrder: boolean

  @Expose()
  @IsBoolean()
  ticket: boolean

  @Expose()
  @IsBoolean()
  stockCheck: boolean

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
export class ProductMovementFilterQuery {
  @Expose()
  @IsNumber()
  productId: number

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  voucherId: string | ConditionString

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  contactId: number | ConditionNumber

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, MovementType))
  @IsOptional()
  movementType: MovementType | InstanceType<typeof ConditionEnumMovementType>
}

export class ProductMovementSortQuery extends SortQuery { }
