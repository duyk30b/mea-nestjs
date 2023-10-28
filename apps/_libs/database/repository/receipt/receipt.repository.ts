import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { Receipt } from '../../entities'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ReceiptRepository extends PostgreSqlRepository<
  Receipt,
  { [P in 'id' | 'distributorId']?: 'ASC' | 'DESC' },
  { [P in 'distributor' | 'distributorPayments']?: boolean } & {
    receiptItems?: { batch?: boolean; product?: boolean } | false
  }
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Receipt) private receiptRepository: Repository<Receipt>
  ) {
    super(receiptRepository)
  }

  async queryOneBy(
    condition: { id: number; oid: number },
    relation?: {
      distributor?: boolean
      distributorPayments?: boolean
      receiptItems?: { batch?: boolean; product?: boolean } | false
    }
  ): Promise<Receipt> {
    let query = this.manager
      .createQueryBuilder(Receipt, 'receipt')
      .where('receipt.id = :id', { id: condition.id })
      .andWhere('receipt.oid = :oid', { oid: condition.oid })

    if (relation?.distributor) {
      query = query.leftJoinAndSelect('receipt.distributor', 'distributor')
    }

    if (relation?.distributorPayments) {
      query = query.leftJoinAndSelect('invoice.distributorPayments', 'distributorPayment')
    }

    if (relation?.receiptItems) {
      query = query.leftJoinAndSelect('receipt.receiptItems', 'receiptItem')
      if (relation?.receiptItems?.batch) {
        query = query.leftJoinAndSelect('receiptItem.batch', 'batch')
      }
      if (relation?.receiptItems?.product) {
        query = query.leftJoinAndSelect('receiptItem.product', 'product')
      }
    }

    const receipt = await query.getOne()
    return receipt
  }
}
