import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager, FindOptionsWhere, In } from 'typeorm'
import { DTimer } from '../../../common/helpers/time.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { ReceiptStatus } from '../../common/variable'
import { Receipt, ReceiptItem } from '../../entities'
import { ReceiptItemInsertType } from '../../entities/receipt-item.entity'
import { ReceiptInsertType, ReceiptUpdateType } from '../../entities/receipt.entity'
import { ReceiptDraftInsertType, ReceiptDraftUpdateType, ReceiptItemDraftType } from './receipt.dto'

@Injectable()
export class ReceiptDraft {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager
  ) { }

  async createDraft<T extends ReceiptDraftInsertType, X extends ReceiptItemDraftType>(params: {
    oid: number
    receiptInsertDto: NoExtra<ReceiptDraftInsertType, T>
    receiptItemListDto: NoExtra<ReceiptItemDraftType, X>[]
  }) {
    const { oid, receiptInsertDto, receiptItemListDto } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const receiptInsert: ReceiptInsertType = {
        ...receiptInsertDto,
        oid,
        status: ReceiptStatus.Draft,
        paid: 0,
        debt: receiptInsertDto.totalMoney,
        year: DTimer.info(receiptInsertDto.startedAt, 7).year,
        month: DTimer.info(receiptInsertDto.startedAt, 7).month + 1,
        date: DTimer.info(receiptInsertDto.startedAt, 7).date,
        endedAt: null,
      }

      const receiptResult = await manager.insert(Receipt, receiptInsert)
      const receiptId = receiptResult.identifiers?.[0]?.id
      if (!receiptId) {
        throw new Error(`Create Receipt failed: Insert error ${JSON.stringify(receiptResult)}`)
      }

      const receiptItemListInsert = receiptItemListDto.map((i) => {
        const receiptItem: ReceiptItemInsertType = {
          ...i,
          oid,
          receiptId,
          distributorId: receiptInsert.distributorId,
        }
        return receiptItem
      })
      await manager.insert(ReceiptItem, receiptItemListInsert)

      return { receiptId }
    })
  }

  async updateDraftPrepayment<
    T extends ReceiptDraftUpdateType,
    X extends ReceiptItemDraftType,
  >(params: {
    oid: number
    receiptId: number
    receiptUpdateDto: NoExtra<ReceiptDraftUpdateType, T>
    receiptItemListDto: NoExtra<ReceiptItemDraftType, X>[]
  }) {
    const { oid, receiptId, receiptUpdateDto, receiptItemListDto } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const whereReceipt: FindOptionsWhere<Receipt> = {
        id: receiptId,
        oid,
        status: In([ReceiptStatus.Draft, ReceiptStatus.Prepayment]),
      }
      const receiptUpdate: ReceiptUpdateType = {
        ...receiptUpdateDto,
        oid,
        status: ReceiptStatus.Draft,
        paid: 0,
        debt: receiptUpdateDto.totalMoney,
        year: DTimer.info(receiptUpdateDto.startedAt, 7).year,
        month: DTimer.info(receiptUpdateDto.startedAt, 7).month + 1,
        date: DTimer.info(receiptUpdateDto.startedAt, 7).date,
        endedAt: null,
      }
      const receiptUpdateResult = await manager
        .createQueryBuilder()
        .update(Receipt)
        .where(whereReceipt)
        .set(receiptUpdate)
        .returning('*')
        .execute()
      if (receiptUpdateResult.affected !== 1) {
        throw new Error(`Update Receipt ${receiptId} failed: Status invalid`)
      }
      const receipt = Receipt.fromRaw(receiptUpdateResult.raw[0])

      await manager.delete(ReceiptItem, { oid, receiptId })

      const receiptItemListInsert = receiptItemListDto.map((i) => {
        const receiptItem: ReceiptItemInsertType = {
          ...i,
          oid,
          receiptId,
          distributorId: receipt.distributorId,
        }
        return receiptItem
      })
      await manager.insert(ReceiptItem, receiptItemListInsert)

      return { receiptId }
    })
  }
}
