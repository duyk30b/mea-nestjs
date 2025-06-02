import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESTimer } from '../../../common/helpers/time.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Receipt } from '../../entities'
import ReceiptItem, { ReceiptItemInsertType } from '../../entities/receipt-item.entity'
import { ReceiptStatus, ReceiptUpdateType } from '../../entities/receipt.entity'
import { ReceiptItemManager, ReceiptManager } from '../../managers'

export type ReceiptDepositedUpdateType = Omit<
  ReceiptUpdateType,
  keyof Pick<
    Receipt,
    | 'oid'
    | 'status'
    | 'deliveryStatus'
    | 'paid'
    | 'debt'
    | 'year'
    | 'month'
    | 'date'
    | 'endedAt'
    | 'distributorId'
  >
>

export type ReceiptItemDepositedType = Omit<
  ReceiptItemInsertType,
  keyof Pick<ReceiptItem, 'oid' | 'receiptId' | 'distributorId'>
>

@Injectable()
export class ReceiptDepositedOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private receiptItemManager: ReceiptItemManager
  ) { }

  async update<T extends ReceiptDepositedUpdateType, X extends ReceiptItemDepositedType>(params: {
    oid: number
    receiptId: number
    receiptUpdateDto: NoExtra<ReceiptDepositedUpdateType, T>
    receiptItemListDto: NoExtra<ReceiptItemDepositedType, X>[]
  }) {
    const { oid, receiptId, receiptUpdateDto, receiptItemListDto } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const receiptUpdate: ReceiptDepositedUpdateType = {
        ...receiptUpdateDto,
        oid,
        status: ReceiptStatus.Deposited,
        // paid: 0, // giữ nguyên số tiền đã trả
        debt: () => `${receiptUpdateDto.totalMoney} - paid`,
        year: ESTimer.info(receiptUpdateDto.startedAt as number, 7).year,
        month: ESTimer.info(receiptUpdateDto.startedAt as number, 7).month + 1,
        date: ESTimer.info(receiptUpdateDto.startedAt as number, 7).date,
        endedAt: null,
      }
      const receipt = await this.receiptManager.updateOneAndReturnEntity(
        manager,
        {
          id: receiptId,
          oid,
          status: ReceiptStatus.Deposited,
        },
        receiptUpdate
      )

      await this.receiptItemManager.delete(manager, { oid, receiptId })
      const receiptItemListInsert = receiptItemListDto.map((i) => {
        const receiptItem: ReceiptItemInsertType = {
          ...i,
          oid,
          receiptId,
          distributorId: receipt.distributorId,
        }
        return receiptItem
      })
      await this.receiptItemManager.insertMany(manager, receiptItemListInsert)
      return { receipt }
    })
  }
}
