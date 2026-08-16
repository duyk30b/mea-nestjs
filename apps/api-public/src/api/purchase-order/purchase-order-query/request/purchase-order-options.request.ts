import { ConditionNumber, ConditionTimestamp, createConditionEnum, transformConditionEnum } from '@libs/common/dto'
import { SortQuery } from '@libs/common/dto/query'
import { PurchaseOrderStatus } from '@libs/database/entities/purchase-order.entity'
import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsNumber, IsObject, IsOptional, ValidateNested } from 'class-validator'

export class PurchaseOrderRelationQuery {
  @Expose()
  @IsBoolean()
  distributor: boolean

  @Expose()
  @IsObject()
  paymentPurchaseOrderList?: { payment: boolean }

  @Expose()
  @IsObject()
  purchaseOrderItemList?: { product?: boolean; batch?: boolean }
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
  @Type(() => ConditionNumber)
  @ValidateNested({ each: true })
  debt: ConditionNumber

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  startedAt: ConditionTimestamp
}

export class PurchaseOrderSortQuery extends SortQuery {}
