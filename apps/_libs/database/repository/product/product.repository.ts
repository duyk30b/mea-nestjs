import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { Product } from '../../entities'
import { ProductInsertType, ProductUpdateType } from '../../entities/product.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ProductRepository extends PostgreSqlRepository<
  Product,
  { [P in 'id' | 'quantity' | 'fullName' | 'costAmount']?: 'ASC' | 'DESC' },
  { [P in 'productBatches']?: boolean },
  ProductInsertType,
  ProductUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Product) private productRepository: Repository<Product>
  ) {
    super(productRepository)
  }

  async calculateProductQuantity(options: { oid: number; productIds: number[] }) {
    const { oid, productIds } = options
    await this.manager.query(`
            UPDATE  "Product" "product" 
            SET     "quantity" = "spb"."sumQuantity"
            FROM    ( 
                    SELECT "productId", SUM("quantity") as "sumQuantity" 
                        FROM "ProductBatch" 
                        WHERE "productBatch"."productId" IN (${productIds.toString()})
                            AND "productBatch"."oid" = ${oid}
                        GROUP BY "productId" 
                    ) AS "spb" 
            WHERE   "product"."id" = "spb"."productId" 
                        AND "product"."id" IN (${productIds.toString()})
                        AND "product"."oid" = ${oid}
            RETURNING *
        `)
  }
}
