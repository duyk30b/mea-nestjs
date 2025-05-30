import { Injectable } from '@nestjs/common'
import { StockCheck } from '../entities'
import {
  StockCheckInsertType,
  StockCheckRelationType,
  StockCheckSortType,
  StockCheckUpdateType,
} from '../entities/stock-check.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class StockCheckManager extends _PostgreSqlManager<
  StockCheck,
  StockCheckRelationType,
  StockCheckInsertType,
  StockCheckUpdateType,
  StockCheckSortType
> {
  constructor() {
    super(StockCheck)
  }
}
