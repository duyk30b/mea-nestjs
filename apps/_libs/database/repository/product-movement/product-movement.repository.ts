import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { ProductMovement } from '../../entities'
import { ProductMovementType } from '../../entities/product-movement.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ProductMovementRepository extends PostgreSqlRepository<
  ProductMovement,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in 'product']?: boolean }
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(ProductMovement)
    private productMovementRepository: Repository<ProductMovement>
  ) {
    super(productMovementRepository)
  }

  async queryOne(
    condition?: { oid: number; productId?: number; productBatchId?: number },
    relation?: {
      productBatch?: { product?: boolean }
      invoice?: { customer?: boolean }
      receipt?: { distributor?: boolean }
    }
  ) {
    let query = this.manager
      .createQueryBuilder(ProductMovement, 'productMovement')
      .where('productMovement.oid = :oid', { oid: condition.oid })

    if (condition?.productId) {
      query = query.andWhere('productMovement.productId = :productId', {
        productId: condition.productId,
      })
    }
    if (condition?.productBatchId) {
      query = query.andWhere('productMovement.productBatchId = :productBatchId', {
        productBatchId: condition.productBatchId,
      })
    }

    if (relation?.invoice) {
      query = query.leftJoinAndSelect(
        'productMovement.invoice',
        'invoice',
        'productMovement.type = :typeInvoice',
        { typeInvoice: ProductMovementType.Invoice }
      )
    }
    if (relation?.invoice?.customer) {
      query = query.leftJoinAndSelect('invoice.customer', 'customer')
    }

    if (relation?.receipt) {
      query = query.leftJoinAndSelect(
        'productMovement.receipt',
        'receipt',
        'productMovement.type = :typeReceipt',
        { typeReceipt: ProductMovementType.Receipt }
      )
    }
    if (relation?.receipt?.distributor) {
      query = query.leftJoinAndSelect('receipt.distributor', 'distributor')
    }

    const productBatch = await query.getOne()
    return productBatch
  }

  async topTotalMoneyGroupByProduct(options: {
    oid: number
    type: ProductMovementType
    fromTime: number
    toTime: number
  }): Promise<{ productId: number; sumTotalMoney: number }[]> {
    const { oid, type, fromTime, toTime } = options

    return await this.manager.query(`
            SELECT productId, SUM(totalMoney) AS sumTotalMoney
            FROM ProductMovement productMovement
            WHERE oid = ${oid} AND type = ${type} AND (createTime BETWEEN ${fromTime} AND ${toTime})
            GROUP BY productId
            ORDER BY sumTotalMoney DESC
            LIMIT 10
        `)
  }
}
