import { Injectable } from '@nestjs/common'
import { ReceiptItem } from '../entities'
import {
  ReceiptItemInsertType,
  ReceiptItemRelationType,
  ReceiptItemSortType,
  ReceiptItemUpdateType,
} from '../entities/receipt-item.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class ReceiptItemManager extends _PostgreSqlManager<
  ReceiptItem,
  ReceiptItemRelationType,
  ReceiptItemInsertType,
  ReceiptItemUpdateType,
  ReceiptItemSortType
> {
  constructor() {
    super(ReceiptItem)
  }
}
