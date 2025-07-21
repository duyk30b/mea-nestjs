import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsObject, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import {
  MoneyDirection,
  PaymentPersonType,
} from '../../../../../_libs/database/entities/payment.entity'

export class PaymentRelationQuery {
  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  distributor: boolean

  @Expose()
  @IsBoolean()
  employee: boolean

  @Expose()
  @IsBoolean()
  cashier: boolean

  @Expose()
  @IsBoolean()
  paymentMethod: boolean

  @Expose()
  @IsBoolean()
  paymentItemList: boolean
}

export class PaymentFilterQuery {
  @Expose()
  @IsNumber()
  paymentMethodId: number

  @Expose()
  @IsEnumValue(PaymentPersonType)
  @IsIn(valuesEnum(PaymentPersonType))
  paymentPersonType: PaymentPersonType

  @Expose()
  @IsNumber()
  personId: number

  @Expose()
  @IsEnumValue(MoneyDirection)
  @IsIn(valuesEnum(MoneyDirection))
  moneyDirection: MoneyDirection

  @Expose()
  @IsNumber()
  cashierId: number

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
