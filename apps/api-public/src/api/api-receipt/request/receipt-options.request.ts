import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional, ValidateNested } from 'class-validator'
import { ConditionTimestamp, createConditionEnum, transformConditionEnum } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { ReceiptStatus } from '../../../../../_libs/database/common/variable'

export class ReceiptRelationQuery {
  @Expose()
  @IsBoolean()
  distributor: boolean

  @Expose()
  @IsBoolean()
  distributorPaymentList: boolean

  @Expose()
  @IsOptional()
  receiptItemList: false | { product?: boolean, batch?: boolean }
}

const ConditionEnumDeliveryStatus = createConditionEnum(ReceiptStatus)

export class ReceiptFilterQuery {
  @Expose()
  @IsNumber()
  distributorId: number

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, ReceiptStatus))
  @IsOptional()
  status: ReceiptStatus | InstanceType<typeof ConditionEnumDeliveryStatus>

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  startedAt: ConditionTimestamp
}

export class ReceiptSortQuery extends SortQuery { }
