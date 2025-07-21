import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { IsBoolean, IsInt, IsOptional } from 'class-validator'
import { createConditionEnum, transformConditionEnum } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { DeliveryStatus, PaymentMoneyStatus } from '../../../../../_libs/database/common/variable'

export class TicketProductRelationQuery {
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
const ConditionEnumPaymentMoneyStatus = createConditionEnum(PaymentMoneyStatus)

export class TicketProductFilterQuery {
  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, PaymentMoneyStatus))
  @IsOptional()
  paymentMoneyStatus: PaymentMoneyStatus | InstanceType<typeof ConditionEnumPaymentMoneyStatus>

  @Expose()
  @IsInt()
  productId: number

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
