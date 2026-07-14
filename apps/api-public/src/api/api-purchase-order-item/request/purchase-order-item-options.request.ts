import { SortQuery } from '@libs/common/dto/query'
import { Expose } from 'class-transformer'
import { IsBoolean, IsNumber, IsObject, IsString } from 'class-validator'

export class PurchaseOrderItemRelationQuery {
  @Expose()
  @IsObject()
  purchaseOrder: { distributor: boolean }

  @Expose()
  @IsBoolean()
  batch: boolean

  @Expose()
  @IsBoolean()
  product: boolean
}

export class PurchaseOrderItemFilterQuery {
  @Expose()
  @IsString()
  purchaseOrderId: string

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

export class PurchaseOrderItemSortQuery extends SortQuery { }
