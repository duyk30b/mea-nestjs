import { Expose } from 'class-transformer'
import { IsBoolean, IsNumber, IsObject } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class ReceiptItemRelationQuery {
  @Expose()
  @IsObject()
  receipt: { distributor: boolean }

  @Expose()
  @IsBoolean()
  batch: boolean

  @Expose()
  @IsBoolean()
  product: boolean
}

export class ReceiptItemFilterQuery {
  @Expose()
  @IsNumber()
  receiptId: number

  @Expose()
  @IsNumber()
  distributorId: number

  @Expose()
  @IsNumber()
  productId: number

  @Expose()
  @IsNumber()
  batchId: number
}

export class ReceiptItemSortQuery extends SortQuery {}
