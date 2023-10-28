import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { ReceiptItem } from '../../entities'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ReceiptItemRepository extends PostgreSqlRepository<
  ReceiptItem,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in 'receipt' | 'product' | 'batch']?: boolean }
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(ReceiptItem)
    private readonly receiptItemRepository: Repository<ReceiptItem>
  ) {
    super(receiptItemRepository)
  }
}
