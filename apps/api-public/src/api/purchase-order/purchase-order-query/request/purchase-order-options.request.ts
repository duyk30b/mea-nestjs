import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionTimestamp,
  createConditionEnum,
  transformConditionEnum,
} from '../../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../../_libs/common/dto/query'
import { PurchaseOrderStatus } from '../../../../../../_libs/database/entities/purchase-order.entity'

export class PurchaseOrderRelationQuery {
  @Expose()
  @IsBoolean()
  distributor: boolean

  @Expose()
  @IsBoolean()
  paymentList: boolean

  @Expose()
  @IsOptional()
  purchaseOrderItemList: false | { product?: boolean; batch?: boolean }
}

const ConditionEnumDeliveryStatus = createConditionEnum(PurchaseOrderStatus)

export class PurchaseOrderFilterQuery {
  @Expose()
  @IsNumber()
  distributorId: number

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, PurchaseOrderStatus))
  @IsOptional()
  status: PurchaseOrderStatus | InstanceType<typeof ConditionEnumDeliveryStatus>

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  startedAt: ConditionTimestamp
}

export class PurchaseOrderSortQuery extends SortQuery { }
