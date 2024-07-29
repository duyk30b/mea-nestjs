import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { ReceiptItem } from '../../entities'
import { ReceiptItemInsertType, ReceiptItemRelationType, ReceiptItemSortType, ReceiptItemUpdateType } from '../../entities/receipt-item.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ReceiptItemRepository extends PostgreSqlRepository<
  ReceiptItem,
  ReceiptItemSortType,
  ReceiptItemRelationType,
  ReceiptItemInsertType,
  ReceiptItemUpdateType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(ReceiptItem)
    private readonly receiptItemRepository: Repository<ReceiptItem>
  ) {
    super(receiptItemRepository)
  }
}
