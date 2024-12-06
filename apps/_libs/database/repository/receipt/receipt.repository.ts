import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, In, Repository } from 'typeorm'
import { ReceiptStatus } from '../../common/variable'
import { Receipt, ReceiptItem } from '../../entities'
import { ReceiptRelationType, ReceiptSortType } from '../../entities/receipt.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ReceiptRepository extends PostgreSqlRepository<
  Receipt,
  { [P in keyof ReceiptSortType]?: 'ASC' | 'DESC' },
  ReceiptRelationType
> {
  constructor(
    private dataSource: DataSource,
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

  async destroy(params: { oid: number; receiptId: number }) {
    const { oid, receiptId } = params
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const receiptDeleteResult = await manager.delete(Receipt, {
        oid,
        id: receiptId,
        status: In([ReceiptStatus.Draft, ReceiptStatus.Cancelled]),
      })
      if (receiptDeleteResult.affected !== 1) {
        throw new Error(`Delete Receipt ${receiptId} failed: Status invalid`)
      }
      await manager.delete(ReceiptItem, { oid, receiptId })
    })
  }
}
