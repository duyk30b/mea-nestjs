import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { MovementType } from '../../common/variable'
import { ProductMovement } from '../../entities'
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
    condition?: { oid: number; productId?: number },
    relation?: {
      product?: boolean
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

    if (relation?.invoice) {
      query = query.leftJoinAndSelect(
        'productMovement.invoice',
        'invoice',
        'productMovement.type = :typeInvoice',
        { typeInvoice: MovementType.Invoice }
      )
      if (relation?.invoice?.customer) {
        query = query.leftJoinAndSelect('invoice.customer', 'customer')
      }
    }

    if (relation?.receipt) {
      query = query.leftJoinAndSelect(
        'productMovement.receipt',
        'receipt',
        'productMovement.type = :typeReceipt',
        { typeReceipt: MovementType.Receipt }
      )
      if (relation?.receipt?.distributor) {
        query = query.leftJoinAndSelect('receipt.distributor', 'distributor')
      }
    }

    const productBatch = await query.getOne()
    return productBatch
  }

  async topTotalMoneyGroupByProduct(options: {
    oid: number
    type: MovementType
    fromTime: number
    toTime: number
  }): Promise<{ productId: number; sumTotalMoney: number }[]> {
    const { oid, type, fromTime, toTime } = options

    return await this.manager.query(`
      SELECT productId, SUM(totalMoney) AS sumTotalMoney
      FROM ProductMovement productMovement
      WHERE oid = ${oid} AND type = ${type} AND (createdAt BETWEEN ${fromTime} AND ${toTime})
      GROUP BY productId
      ORDER BY sumTotalMoney DESC
      LIMIT 10
    `)
  }
}
