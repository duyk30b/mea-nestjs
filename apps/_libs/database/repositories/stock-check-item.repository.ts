import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { StockCheckItem } from '../entities'
import {
  StockCheckItemInsertType,
  StockCheckItemRelationType,
  StockCheckItemSortType,
  StockCheckItemUpdateType,
} from '../entities/stock-check-item.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class StockCheckItemRepository extends _PostgreSqlRepository<
  StockCheckItem,
  StockCheckItemRelationType,
  StockCheckItemInsertType,
  StockCheckItemUpdateType,
  StockCheckItemSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(StockCheckItem)
    private readonly stockCheckItemRepository: Repository<StockCheckItem>
  ) {
    super(StockCheckItem, stockCheckItemRepository)
  }
}
