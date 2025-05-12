import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { StockCheck } from '../entities'
import {
  StockCheckInsertType,
  StockCheckRelationType,
  StockCheckSortType,
  StockCheckUpdateType,
} from '../entities/stock-check.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class StockCheckRepository extends _PostgreSqlRepository<
  StockCheck,
  StockCheckRelationType,
  StockCheckInsertType,
  StockCheckUpdateType,
  StockCheckSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(StockCheck)
    private readonly stockCheckRepository: Repository<StockCheck>
  ) {
    super(StockCheck, stockCheckRepository)
  }
}
