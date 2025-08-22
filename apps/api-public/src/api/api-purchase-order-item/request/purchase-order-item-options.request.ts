import { Expose } from 'class-transformer'
import { IsBoolean, IsNumber, IsObject } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

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
  @IsNumber()
  purchaseOrderId: number

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
