import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { ESTimer } from '../../../common/helpers/time.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { DeliveryStatus } from '../../common/variable'
import { Receipt, ReceiptItem } from '../../entities'
import { ReceiptItemInsertType } from '../../entities/receipt-item.entity'
import { ReceiptInsertType, ReceiptStatus } from '../../entities/receipt.entity'
import { ReceiptItemManager, ReceiptManager } from '../../managers'

export type ReceiptDraftUpsertType = Omit<
  ReceiptInsertType,
  keyof Pick<
    Receipt,
    'oid' | 'status' | 'deliveryStatus' | 'paid' | 'debt' | 'year' | 'month' | 'date' | 'endedAt'
  >
>

export type ReceiptItemDraftType = Omit<
  ReceiptItemInsertType,
  keyof Pick<ReceiptItem, 'oid' | 'receiptId' | 'distributorId'>
>
@Injectable()
export class ReceiptDraftOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private receiptManager: ReceiptManager,
    private receiptItemManager: ReceiptItemManager
  ) { }

  async createDraft<T extends ReceiptDraftUpsertType, X extends ReceiptItemDraftType>(params: {
    oid: number
    receiptInsertDto: NoExtra<ReceiptDraftUpsertType, T>
    receiptItemListDto: NoExtra<ReceiptItemDraftType, X>[]
  }) {
    const { oid, receiptInsertDto, receiptItemListDto } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const receiptInsert: ReceiptInsertType = {
        ...receiptInsertDto,
        oid,
        status: ReceiptStatus.Draft,
        deliveryStatus: DeliveryStatus.Pending,
        distributorId: receiptInsertDto.distributorId,
        paid: 0,
        debt: receiptInsertDto.totalMoney,
        year: ESTimer.info(receiptInsertDto.startedAt, 7).year,
        month: ESTimer.info(receiptInsertDto.startedAt, 7).month + 1,
        date: ESTimer.info(receiptInsertDto.startedAt, 7).date,
        endedAt: null,
      }

      const receipt = await this.receiptManager.insertOneAndReturnEntity(manager, receiptInsert)

      const receiptItemListInsert = receiptItemListDto.map((i) => {
        const receiptItem: ReceiptItemInsertType = {
          ...i,
          oid,
          receiptId: receipt.id,
          distributorId: receiptInsert.distributorId,
        }
        return receiptItem
      })
      await this.receiptItemManager.insertMany(manager, receiptItemListInsert)

      return { receipt }
    })
  }

  async updateDraft<T extends ReceiptDraftUpsertType, X extends ReceiptItemDraftType>(params: {
    oid: number
    receiptId: number
    receiptUpdateDto: NoExtra<ReceiptDraftUpsertType, T>
    receiptItemListDto: NoExtra<ReceiptItemDraftType, X>[]
  }) {
    const { oid, receiptId, receiptUpdateDto, receiptItemListDto } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const receiptUpdate: ReceiptDraftUpsertType = {
        ...receiptUpdateDto,
        oid,
        distributorId: receiptUpdateDto.distributorId,
        status: ReceiptStatus.Draft,
        paid: 0,
        debt: receiptUpdateDto.totalMoney,
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
          status: ReceiptStatus.Draft,
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
