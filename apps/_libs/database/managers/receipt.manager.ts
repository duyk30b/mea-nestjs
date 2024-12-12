import { Injectable } from '@nestjs/common'
import { Receipt } from '../entities'
import {
  ReceiptInsertType,
  ReceiptRelationType,
  ReceiptSortType,
  ReceiptUpdateType,
} from '../entities/receipt.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class ReceiptManager extends _PostgreSqlManager<
  Receipt,
  ReceiptRelationType,
  ReceiptInsertType,
  ReceiptUpdateType,
  ReceiptSortType
> {
  constructor() {
    super(Receipt)
  }
}
