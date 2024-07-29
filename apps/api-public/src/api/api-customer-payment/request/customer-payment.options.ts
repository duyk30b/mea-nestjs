import { Expose } from 'class-transformer'
import { IsBoolean, IsNumber } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { PaymentType } from '../../../../../_libs/database/common/variable'

export class CustomerPaymentRelationQuery {
  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  ticket: boolean
}

export class CustomerPaymentFilterQuery {
  @Expose()
  @IsNumber()
  customerId: number

  @Expose()
  @IsNumber()
  ticketId: number

  @Expose()
  @IsEnumValue(PaymentType)
  paymentType: PaymentType
}

export class CustomerPaymentSortQuery extends SortQuery { }
