import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionTimestamp,
  createConditionEnum,
  transformConditionEnum,
} from '../../../../../_libs/common/dto'
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

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt: ConditionTimestamp
}

export class TicketProductSortQuery extends SortQuery { }

export class TicketProductStatisticSortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  productId: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  count: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumQuantity: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumCostAmount: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumActualAmount: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  sumProfitAmount: 'ASC' | 'DESC'
}
