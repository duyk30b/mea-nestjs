import { ConditionTimestamp, createConditionEnum, transformConditionEnum } from '@libs/common/dto'
import { SortQuery } from '@libs/common/dto/query'
import { valuesEnum } from '@libs/common/helpers/typescript.helper'
import { IsEnumValue } from '@libs/common/transform-validate/class-validator.custom'
import {
  MoneyDirection,
  PaymentActionType,
  PaymentPersonType,
} from '@libs/database/entities/payment.entity'
import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

export class PaymentRelationQuery {
  @Expose()
  @IsBoolean()
  customer?: boolean

  @Expose()
  @IsBoolean()
  distributor?: boolean

  @Expose()
  @IsBoolean()
  employee?: boolean

  @Expose()
  @IsBoolean()
  cashier?: boolean

  @Expose()
  @IsBoolean()
  wallet?: boolean

  @Expose()
  @IsObject()
  paymentTicketList?: { ticket?: boolean }

  @Expose()
  @IsObject()
  paymentPurchaseOrderList?: { purchaseOrder?: boolean }
}

const ConditionEnumMoneyDirection = createConditionEnum(MoneyDirection)

export class PaymentFilterQuery {
  @Expose()
  @IsEnumValue(PaymentPersonType)
  @IsIn(valuesEnum(PaymentPersonType))
  personType: PaymentPersonType

  @Expose()
  @IsNumber()
  personId: number

  @Expose()
  @IsNumber()
  cashierId: number

  @Expose()
  @IsString()
  walletId: string

  @Expose()
  @IsEnumValue(PaymentActionType)
  @IsIn(valuesEnum(PaymentActionType))
  paymentActionType: PaymentActionType

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, MoneyDirection))
  @IsOptional()
  moneyDirection: MoneyDirection | InstanceType<typeof ConditionEnumMoneyDirection>

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt: ConditionTimestamp
}

export class PaymentSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  createdAt: 'ASC' | 'DESC'
}

export class PaymentResponseQuery {
  @Expose()
  @IsObject()
  @ValidateNested({ each: true })
  payment: PaymentRelationQuery
}
