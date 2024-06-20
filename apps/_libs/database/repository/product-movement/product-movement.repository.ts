import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { VoucherType } from '../../common/variable'
import { ProductMovement } from '../../entities'
import {
  ProductMovementRelationType,
  ProductMovementSortType,
} from '../../entities/product-movement.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ProductMovementRepository extends PostgreSqlRepository<
  ProductMovement,
  { [P in keyof ProductMovementSortType]?: 'ASC' | 'DESC' },
  { [P in keyof ProductMovementRelationType]?: boolean }
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
      receipt?: { distributor?: boolean }
      invoice?: { customer?: boolean }
      visit?: { customer?: boolean }
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

    if (relation?.receipt) {
      query = query.leftJoinAndSelect(
        'productMovement.receipt',
        'receipt',
        'productMovement.voucherType = :typeReceipt',
        { typeReceipt: VoucherType.Receipt }
      )
      if (relation?.receipt?.distributor) {
        query = query.leftJoinAndSelect('receipt.distributor', 'distributor')
      }
    }

    if (relation?.invoice) {
      query = query.leftJoinAndSelect(
        'productMovement.invoice',
        'invoice',
        'productMovement.voucherType = :typeInvoice',
        { typeInvoice: VoucherType.Invoice }
      )
      if (relation?.invoice?.customer) {
        query = query.leftJoinAndSelect('invoice.customer', 'customer')
      }
    }

    if (relation?.visit) {
      query = query.leftJoinAndSelect(
        'productMovement.visit',
        'visit',
        'productMovement.voucherType = :typeInvoice',
        { typeInvoice: VoucherType.Visit }
      )
      if (relation?.visit?.customer) {
        query = query.leftJoinAndSelect('visit.customer', 'customer')
      }
    }

    const productMovement = await query.getOne()
    return productMovement
  }

  async topTotalMoneyGroupByProduct(options: {
    oid: number
    type: VoucherType
    fromTime: number
    toTime: number
  }): Promise<{ productId: number; sumTotalMoney: number }[]> {
    const { oid, type, fromTime, toTime } = options

    return await this.manager.query(`
      SELECT productId, SUM(totalMoney) AS sumTotalMoney
      FROM ProductMovement productMovement
      WHERE oid = ${oid} AND voucherType = ${type} AND (createdAt BETWEEN ${fromTime} AND ${toTime})
      GROUP BY productId
      ORDER BY sumTotalMoney DESC
      LIMIT 10
    `)
  }
}
