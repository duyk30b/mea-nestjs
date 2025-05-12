import { Injectable } from '@nestjs/common'
import { StockCheckItem } from '../entities'
import {
  StockCheckItemInsertType,
  StockCheckItemRelationType,
  StockCheckItemSortType,
  StockCheckItemUpdateType,
} from '../entities/stock-check-item.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class StockCheckItemManager extends _PostgreSqlManager<
  StockCheckItem,
  StockCheckItemRelationType,
  StockCheckItemInsertType,
  StockCheckItemUpdateType,
  StockCheckItemSortType
> {
  constructor() {
    super(StockCheckItem)
  }
}
