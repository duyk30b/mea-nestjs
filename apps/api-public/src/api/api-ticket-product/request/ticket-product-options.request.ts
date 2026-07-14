import {
    ConditionTimestamp,
    createConditionEnum,
    transformConditionEnum,
} from '@libs/common/dto'
import { SortQuery } from '@libs/common/dto/query'
import { DeliveryStatus, PaymentMoneyStatus } from '@libs/database/common/variable'
import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsInt, IsOptional, ValidateNested } from 'class-validator'

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
  ticketId: string

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, DeliveryStatus))
  @IsOptional()
  deliveryStatus: DeliveryStatus | InstanceType<typeof ConditionEnumDeliveryStatus>

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt: ConditionTimestamp
}

export class TicketProductSortQuery extends SortQuery { }
