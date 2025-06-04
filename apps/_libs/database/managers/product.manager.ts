import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { Product } from '../entities'
import {
    ProductInsertType,
    ProductRelationType,
    ProductSortType,
    ProductUpdateType,
} from '../entities/product.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class ProductManager extends _PostgreSqlManager<
  Product,
  ProductRelationType,
  ProductInsertType,
  ProductUpdateType,
  ProductSortType
> {
  constructor() {
    super(Product)
  }

  async reCalculateQuantityBySumBatchList(options: {
    manager: EntityManager
    oid: number
    productIdList: number[]
  }) {
    const { manager, oid, productIdList } = options
    const resultQuery: [any[], number] = await manager.query(`
        UPDATE  "Product" "product" 
        SET     "quantity" = "sbq"."sumQuantity"
        FROM    ( 
                SELECT "productId", SUM("quantity") as "sumQuantity" 
                    FROM "Batch" 
                    WHERE "Batch"."productId" IN (${productIdList.toString()})
                        AND "Batch"."oid" = ${oid}
                    GROUP BY "productId" 
                ) AS "sbq" 
        WHERE   "product"."id" = "sbq"."productId" 
            AND "product"."id" IN (${productIdList.toString()})
            AND "product"."oid" = ${oid}
        RETURNING "product".*
    `)
    return Product.fromRaws(resultQuery[0])
  }
}
