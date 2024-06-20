import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Product } from '../../entities'
import {
  ProductInsertType,
  ProductRelationType,
  ProductSortType,
  ProductUpdateType,
} from '../../entities/product.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ProductRepository extends PostgreSqlRepository<
  Product,
  { [P in keyof ProductSortType]?: 'ASC' | 'DESC' },
  { [P in keyof ProductRelationType]?: boolean },
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

  async insertOneAndReturnEntity<X extends Partial<ProductInsertType>>(
    data: NoExtra<Partial<ProductInsertType>, X>
  ): Promise<Product> {
    const raw = await this.insertOneAndReturnRaw(data)
    return Product.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<ProductUpdateType>>(
    condition: BaseCondition<Product>,
    data: NoExtra<Partial<ProductUpdateType>, X>
  ): Promise<Product[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Product.fromRaws(raws)
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
