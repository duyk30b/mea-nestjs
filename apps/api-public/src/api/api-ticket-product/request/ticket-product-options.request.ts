import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { IsBoolean, IsInt, IsOptional } from 'class-validator'
import { createConditionEnum, transformConditionEnum } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { DeliveryStatus } from '../../../../../_libs/database/common/variable'

export class TicketProductRelationQuery {
  @Expose()
  @IsBoolean()
  batch: boolean

  @Expose()
  @IsBoolean()
  product: boolean

  @Expose()
  @IsBoolean()
  ticket: boolean

  @Expose()
  @IsBoolean()
  customer: boolean
}

const ConditionEnumDeliveryStatus = createConditionEnum(DeliveryStatus)

export class TicketProductFilterQuery {
  @Expose()
  @IsInt()
  productId: number

  @Expose()
  @IsInt()
  batchId: number

  @Expose()
  @IsInt()
  customerId: number

  @Expose()
  @IsInt()
  ticketId: number

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, DeliveryStatus))
  @IsOptional()
  deliveryStatus: DeliveryStatus | InstanceType<typeof ConditionEnumDeliveryStatus>
}

export class TicketProductSortQuery extends SortQuery { }
