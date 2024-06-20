import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { VoucherType } from '../../common/variable'
import { BatchMovement } from '../../entities'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class BatchMovementRepository extends PostgreSqlRepository<
  BatchMovement,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in 'product' | 'batch']?: boolean }
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(BatchMovement)
    private batchMovementRepository: Repository<BatchMovement>
  ) {
    super(batchMovementRepository)
  }

  async queryOne(
    condition?: { oid: number; productId?: number; batchId?: number },
    relation?: {
      product?: boolean
      batch?: boolean
      receipt?: { distributor?: boolean }
      invoice?: { customer?: boolean }
      visit?: { customer?: boolean }
    }
  ) {
    let query = this.manager
      .createQueryBuilder(BatchMovement, 'productMovement')
      .where('productMovement.oid = :oid', { oid: condition.oid })

    if (condition?.productId) {
      query = query.andWhere('productMovement.productId = :productId', {
        productId: condition.productId,
      })
    }
    if (condition?.batchId) {
      query = query.andWhere('productMovement.batchId = :batchId', {
        batchId: condition.batchId,
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

    const batch = await query.getOne()
    return batch
  }
}
