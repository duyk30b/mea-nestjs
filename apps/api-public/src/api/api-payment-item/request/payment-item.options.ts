import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import {
  PaymentVoucherItemType,
  PaymentVoucherType,
} from '../../../../../_libs/database/entities/payment-item.entity'
import { PaymentPersonType } from '../../../../../_libs/database/entities/payment.entity'

export class PaymentItemRelationQuery {
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
  payment: boolean

  @Expose()
  @IsBoolean()
  ticket: boolean

  @Expose()
  @IsBoolean()
  receipt: boolean

  @Expose()
  @IsBoolean()
  ticketProcedure: boolean

  @Expose()
  @IsBoolean()
  ticketLaboratoryGroup: boolean

  @Expose()
  @IsBoolean()
  ticketRadiology: boolean
}

export class PaymentItemFilterQuery {
  @Expose()
  @IsNumber()
  paymentId: number

  @Expose()
  @IsEnumValue(PaymentPersonType)
  @IsIn(valuesEnum(PaymentPersonType))
  paymentPersonType: PaymentPersonType

  @Expose()
  @IsNumber()
  personId: number

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt: ConditionTimestamp

  @Expose()
  @IsEnumValue(PaymentVoucherType)
  @IsIn(valuesEnum(PaymentVoucherType))
  voucherType: PaymentVoucherType

  @Expose()
  @IsNumber()
  voucherId: number

  @Expose()
  @IsEnumValue(PaymentVoucherItemType)
  @IsIn(valuesEnum(PaymentVoucherItemType))
  voucherItemType: PaymentVoucherItemType

  @Expose()
  @IsNumber()
  voucherItemId: number

  @Expose()
  @IsNumber()
  cashierId: number
}

export class PaymentItemSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  createdAt: 'ASC' | 'DESC'
}
