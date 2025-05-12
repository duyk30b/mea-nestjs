import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, In, Repository } from 'typeorm'
import { Receipt, ReceiptItem } from '../entities'
import {
  ReceiptInsertType,
  ReceiptRelationType,
  ReceiptSortType,
  ReceiptStatus,
  ReceiptUpdateType,
} from '../entities/receipt.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class ReceiptRepository extends _PostgreSqlRepository<
  Receipt,
  ReceiptRelationType,
  ReceiptInsertType,
  ReceiptUpdateType,
  ReceiptSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>
  ) {
    super(Receipt, receiptRepository)
  }

  async queryOneBy(
    condition: { id: number; oid: number },
    relation?: ReceiptRelationType
  ): Promise<Receipt> {
    let query = this.manager
      .createQueryBuilder(Receipt, 'receipt')
      .where('receipt.id = :id', { id: condition.id })
      .andWhere('receipt.oid = :oid', { oid: condition.oid })

    if (relation?.distributor) {
      query = query.leftJoinAndSelect('receipt.distributor', 'distributor')
    }

    if (relation?.receiptItemList) {
      query = query.leftJoinAndSelect('receipt.receiptItemList', 'receiptItem')
      if (relation?.receiptItemList?.batch) {
        query = query.leftJoinAndSelect('receiptItem.batch', 'batch')
      }
      if (relation?.receiptItemList?.product) {
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
        paid: 0,
        status: In([ReceiptStatus.Draft, ReceiptStatus.Deposited, ReceiptStatus.Cancelled]),
      })
      if (receiptDeleteResult.affected !== 1) {
        throw new Error(`Delete Receipt ${receiptId} failed: Status invalid`)
      }
      await manager.delete(ReceiptItem, { oid, receiptId })
    })
  }
}
