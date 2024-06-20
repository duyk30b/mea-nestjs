import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsNumber, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto/condition-timestamp'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { InvoiceStatus } from '../../../../../_libs/database/common/variable'

export class InvoiceRelationQuery {
  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  customerPayments: boolean

  @Expose()
  @IsBoolean()
  invoiceItems: boolean

  @Expose()
  @IsBoolean()
  invoiceExpenses: boolean

  @Expose()
  @IsBoolean()
  invoiceSurcharges: boolean
}
export class InvoiceFilterQuery {
  @Expose()
  @IsNumber()
  customerId: number

  @Expose()
  @IsEnumValue(InvoiceStatus)
  status: InvoiceStatus

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  startedAt: ConditionTimestamp

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  deletedAt: ConditionTimestamp
}

export class InvoiceSortQuery extends SortQuery {}
