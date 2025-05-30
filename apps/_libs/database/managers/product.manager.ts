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

  async calculateQuantityProductList(options: {
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

  async changeQuantity(options: {
    manager: EntityManager
    oid: number
    changeList: { productId: number; quantity: number }[]
  }) {
    const { manager, oid, changeList } = options
    let productModifiedList: Product[] = []

    if (changeList.length) {
      const productModifiedRaw: [any[], number] = await manager.query(
        `
      UPDATE "Product" AS "product"
      SET "quantity"    = "product"."quantity" + temp."quantity"
      FROM (VALUES `
        + changeList.map((c) => `(${c.productId}, ${c.quantity})`).join(', ')
        + `   ) AS temp("productId", "quantity")
      WHERE   "product"."id" = temp."productId" 
      AND "product"."oid" = ${oid} 
      RETURNING "product".*;   
      `
      )
      if (productModifiedRaw[0].length != changeList.length) {
        throw new Error(`Update Product failed, ${JSON.stringify(productModifiedRaw)}`)
      }
      productModifiedList = Product.fromRaws(productModifiedRaw[0])
    }

    return productModifiedList
  }
}
