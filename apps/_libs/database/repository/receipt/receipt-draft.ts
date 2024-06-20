import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager, FindOptionsWhere, In, IsNull } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { ReceiptStatus } from '../../common/variable'
import { Receipt, ReceiptItem } from '../../entities'
import { ReceiptItemInsertType } from '../../entities/receipt-item.entity'
import { ReceiptInsertType } from '../../entities/receipt.entity'
import { ReceiptDraftInsertType, ReceiptDraftUpdateType, ReceiptItemDraftType } from './receipt.dto'

@Injectable()
export class ReceiptDraft {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager
  ) {}

  async createDraft<T extends ReceiptDraftInsertType>(params: {
    oid: number
    receiptInsertDto: NoExtra<ReceiptDraftInsertType, T>
    receiptItemListDto: ReceiptItemDraftType[]
  }) {
    const { oid, receiptInsertDto, receiptItemListDto } = params
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const receiptInsert: ReceiptInsertType = {
        ...receiptInsertDto,
        oid,
        status: ReceiptStatus.Draft,
        paid: 0,
        debt: 0,
        year: 0,
        month: 0,
        date: 0,
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

  async updateReceiptDraftAndReceiptPrepayment<T extends ReceiptDraftUpdateType>(params: {
    oid: number
    receiptId: number
    receiptUpdateDto: NoExtra<ReceiptDraftUpdateType, T>
    receiptItemListDto: ReceiptItemDraftType[]
  }) {
    const { oid, receiptId, receiptUpdateDto, receiptItemListDto } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const whereReceipt: FindOptionsWhere<Receipt> = {
        id: receiptId,
        oid,
        status: In([ReceiptStatus.Draft, ReceiptStatus.Prepayment]),
      }
      const receiptUpdateResult = await manager
        .createQueryBuilder()
        .update(Receipt)
        .where(whereReceipt)
        .set(receiptUpdateDto)
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

  async destroyDraft(params: { oid: number; receiptId: number }) {
    const { oid, receiptId } = params
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const receiptDeleteResult = await manager.delete(Receipt, {
        oid,
        id: receiptId,
        status: ReceiptStatus.Draft,
      })
      if (receiptDeleteResult.affected !== 1) {
        throw new Error(`Delete Receipt ${receiptId} failed: Status invalid`)
      }
      await manager.delete(ReceiptItem, { oid, receiptId })
    })
  }

  async softDeleteRefund(params: { oid: number; receiptId: number }) {
    const { oid, receiptId } = params
    const receiptUpdateResult = await this.manager.update(
      Receipt,
      {
        id: receiptId,
        oid,
        status: ReceiptStatus.Refund,
        deletedAt: IsNull(),
      },
      { deletedAt: Date.now() }
    )
    if (receiptUpdateResult.affected !== 1) {
      throw new Error(`Delete Receipt ${receiptId} failed: Status invalid`)
    }
  }
}
