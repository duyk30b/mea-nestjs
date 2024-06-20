import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { IsBoolean, IsNumber, IsObject, IsOptional } from 'class-validator'
import { createConditionEnum, transformConditionEnum } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { InvoiceItemType } from '../../../../../_libs/database/common/variable'

const ConditionEnumInvoiceItemType = createConditionEnum(InvoiceItemType)

export class InvoiceItemRelationQuery {
  @Expose()
  @IsBoolean()
  procedure: boolean

  @Expose()
  @IsBoolean()
  batch: boolean

  @Expose()
  @IsBoolean()
  product: boolean

  @Expose()
  @IsObject()
  invoice: { customer: boolean }
}

export class InvoiceItemFilterQuery {
  @Expose()
  @IsNumber()
  productId: number

  @Expose()
  @IsNumber()
  batchId: number

  @Expose()
  @IsNumber()
  procedureId: number

  @Expose()
  @IsNumber()
  customerId: number

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, InvoiceItemType))
  @IsOptional()
  type: InvoiceItemType | InstanceType<typeof ConditionEnumInvoiceItemType>
}

export class InvoiceItemSortQuery extends SortQuery {}
