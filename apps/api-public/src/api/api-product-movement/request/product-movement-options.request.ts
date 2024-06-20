import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional } from 'class-validator'
import {
  ConditionNumber,
  SortQuery,
  createConditionEnum,
  transformConditionEnum,
  transformConditionNumber,
} from '../../../../../_libs/common/dto'
import { VoucherType } from '../../../../../_libs/database/common/variable'

const ConditionEnumVoucherType = createConditionEnum(VoucherType)

export class ProductMovementRelationQuery {
  @Expose()
  @IsBoolean()
  product: boolean

  @Expose()
  @IsBoolean()
  receipt: boolean

  @Expose()
  @IsBoolean()
  invoice: boolean

  @Expose()
  @IsBoolean()
  visit: boolean

  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  distributor: boolean
}
export class ProductMovementFilterQuery {
  @Expose()
  @IsNumber()
  productId: number

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  voucherId: number | ConditionNumber

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  contactId: number | ConditionNumber

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, VoucherType))
  @IsOptional()
  voucherType: VoucherType | InstanceType<typeof ConditionEnumVoucherType>
}

export class ProductMovementSortQuery extends SortQuery {}
