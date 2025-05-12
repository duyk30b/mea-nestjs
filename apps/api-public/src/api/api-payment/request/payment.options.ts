import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import {
  MoneyDirection,
  PaymentTiming,
  PersonType,
  VoucherType,
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
  ticket: boolean

  @Expose()
  @IsBoolean()
  receipt: boolean

  @Expose()
  @IsBoolean()
  cashier: boolean

  @Expose()
  @IsBoolean()
  paymentMethod: boolean
}

export class PaymentFilterQuery {
  @Expose()
  @IsNumber()
  paymentMethodId: number

  @Expose()
  @IsEnumValue(VoucherType)
  @IsIn(valuesEnum(VoucherType))
  voucherType: VoucherType

  @Expose()
  @IsNumber()
  voucherId: number

  @Expose()
  @IsEnumValue(PersonType)
  @IsIn(valuesEnum(PersonType))
  personType: PersonType

  @Expose()
  @IsNumber()
  personId: number

  @Expose()
  @IsEnumValue(PaymentTiming)
  @IsIn(valuesEnum(PaymentTiming))
  paymentTiming: PaymentTiming

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt: ConditionTimestamp

  @Expose()
  @IsEnumValue(MoneyDirection)
  @IsIn(valuesEnum(MoneyDirection))
  moneyDirection: MoneyDirection

  @Expose()
  @IsNumber()
  cashierId: number
}

export class PaymentSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  createdAt: 'ASC' | 'DESC'
}
