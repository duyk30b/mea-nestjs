import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Product } from '../../entities';

@Injectable()
export class ProductOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager
  ) { }

  async reCalculateQuantityBySumBatch(options: { oid: number; productId: number }) {
    const { oid, productId } = options
    const resultQuery: [any[], number] = await this.manager.query(`
        UPDATE  "Product"
        SET     "quantity" = ( 
                    SELECT COALESCE(SUM("quantity"), 0)
                    FROM "Batch" WHERE "productId" = ${productId}
                )
        WHERE   "id" = ${productId} AND "oid" = ${oid}
        RETURNING *
    `)
    if (resultQuery[0].length !== 1) {
      throw new Error(`Update Product failed`)
    }
    return Product.fromRaw(resultQuery[0][0])
  }

  async reCalculateQuantityBySumBatchList(options: { oid: number; productIdList: number[] }) {
    const { oid, productIdList } = options
    const resultQuery: [any[], number] = await this.manager.query(`
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
        RETURNING "Product".*
    `)
    return Product.fromRaws(resultQuery[0])
  }
}
