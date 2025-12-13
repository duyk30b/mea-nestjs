import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import {
  MoneyDirection,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../../../../_libs/database/entities/payment.entity'

export class PaymentRelationQuery {
  @Expose()
  @IsBoolean()
  ticket: boolean

  @Expose()
  @IsBoolean()
  purchaseOrder?: boolean

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
  @IsBoolean()
  paymentTicketItemList?: boolean
}

export class PaymentFilterQuery {
  @Expose()
  @IsEnumValue(PaymentVoucherType)
  @IsIn(valuesEnum(PaymentVoucherType))
  voucherType: PaymentVoucherType

  @Expose()
  @IsString()
  voucherId: string

  @Expose()
  @IsString()
  walletId: string

  @Expose()
  @IsEnumValue(PaymentPersonType)
  @IsIn(valuesEnum(PaymentPersonType))
  personType: PaymentPersonType

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
