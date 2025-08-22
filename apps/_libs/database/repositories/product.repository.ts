import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { Product } from '../entities'
import {
  ProductInsertType,
  ProductRelationType,
  ProductSortType,
  ProductUpdateType,
} from '../entities/product.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

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

@Injectable()
export class ProductRepository extends _PostgreSqlRepository<
  Product,
  ProductRelationType,
  ProductInsertType,
  ProductUpdateType,
  ProductSortType
> {
  constructor(@InjectRepository(Product) private productRepository: Repository<Product>) {
    super(Product, productRepository)
  }
}
