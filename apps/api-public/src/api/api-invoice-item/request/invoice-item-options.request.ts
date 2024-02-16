import { Expose } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber, IsObject } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { InvoiceItemType } from '../../../../../_libs/database/common/variable'

export class InvoiceItemRelationQuery {
  @Expose()
  @IsBoolean()
  procedure: boolean

  @Expose()
  @IsObject()
  productBatch: { product: boolean }

  @Expose()
  @IsObject()
  invoice: { customer: boolean }
}

export class InvoiceItemFilterQuery {
  @Expose()
  @IsNumber()
  referenceId: number

  @Expose()
  @IsNumber()
  customerId: number

  @Expose()
  @IsEnum(InvoiceItemType)
  type: InvoiceItemType
}

export class InvoiceItemSortQuery extends SortQuery {}
