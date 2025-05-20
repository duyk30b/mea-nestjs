import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, Raw, UpdateResult } from 'typeorm'
import { ESTimer } from '../../../common/helpers/time.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { PaymentType, ReceiptStatus } from '../../common/variable'
import { Distributor, DistributorPayment, Receipt } from '../../entities'
import { DistributorPaymentInsertType } from '../../entities/distributor-payment.entity'
import ReceiptItem, { ReceiptItemInsertType } from '../../entities/receipt-item.entity'
import { ReceiptUpdateType } from '../../entities/receipt.entity'
import { ReceiptItemManager, ReceiptManager } from '../../managers'

export type ReceiptPrepaymentUpdateType = Omit<
  ReceiptUpdateType,
  keyof Pick<
    Receipt,
    'oid' | 'status' | 'paid' | 'debt' | 'year' | 'month' | 'date' | 'endedAt' | 'distributorId'
  >
>

export type ReceiptItemPrepaymentType = Omit<
  ReceiptItemInsertType,
  keyof Pick<ReceiptItem, 'oid' | 'receiptId' | 'distributorId'>
>

@Injectable()
export class ReceiptPrepaymentOperation {
  constructor(
    private dataSource: DataSource,
    private receiptManager: ReceiptManager,
    private receiptItemManager: ReceiptItemManager
  ) { }

  async updatePrepayment<
    T extends ReceiptPrepaymentUpdateType,
    X extends ReceiptItemPrepaymentType,
  >(params: {
    oid: number
    receiptId: number
    receiptUpdateDto: NoExtra<ReceiptPrepaymentUpdateType, T>
    receiptItemListDto: NoExtra<ReceiptItemPrepaymentType, X>[]
  }) {
    const { oid, receiptId, receiptUpdateDto, receiptItemListDto } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const receiptUpdate: ReceiptPrepaymentUpdateType = {
        ...receiptUpdateDto,
        oid,
        status: ReceiptStatus.Prepayment,
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
          status: ReceiptStatus.Prepayment,
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

  async prepayment(params: { oid: number; receiptId: number; time: number; money: number }) {
    const { oid, receiptId, time, money } = params
    if (money < 0) {
      throw new Error(`Prepayment Receipt ${receiptId} failed: Money number invalid`)
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE RECEIPT ===
      const whereReceipt: FindOptionsWhere<Receipt> = {
        oid,
        id: receiptId,
        status: In([ReceiptStatus.Draft, ReceiptStatus.Prepayment]),
        totalMoney: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
      }
      const receiptUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Receipt)
        .where(whereReceipt)
        .set({
          status: ReceiptStatus.Prepayment,
          paid: () => `paid + ${money}`,
          debt: () => `debt - ${money}`,
        })
        .returning('*')
        .execute()
      if (receiptUpdateResult.affected !== 1) {
        throw new Error(`Receipt PayDebt failed: ReceiptId:${receiptId} update failed`)
      }
      const receipt = Receipt.fromRaw(receiptUpdateResult.raw[0])

      // Prepayment có thê thanh toán 0 đồng mục đích chỉ để chuyển trạng thái
      // Nếu thanh toán = 0 thì ko lưu lịch sử
      if (money > 0) {
        // === 2. GET DISTRIBUTOR ===
        const distributor = await manager.findOneBy(Distributor, {
          oid,
          id: receipt.distributorId,
        })
        if (!distributor) {
          throw new Error(`Nhà cung cấp không tồn tại trên hệ thống`)
        }
        const distributorCloseDebt = distributor.debt
        const distributorOpenDebt = distributor.debt

        // === 3. INSERT DISTRIBUTOR_PAYMENT ===
        const distributorPaymentInsert: DistributorPaymentInsertType = {
          oid,
          distributorId: receipt.distributorId,
          receiptId,
          createdAt: time,
          paymentType: PaymentType.Prepayment,
          paid: money,
          debit: 0, // prepayment không phát sinh nợ
          openDebt: distributorOpenDebt,
          closeDebt: distributorCloseDebt,
          note: '',
          description: '',
        }
        const distributorPaymentInsertResult = await manager.insert(
          DistributorPayment,
          distributorPaymentInsert
        )
        const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
        if (!distributorPaymentId) {
          throw new Error(
            `Create DistributorPayment failed: Insert error ${JSON.stringify(
              distributorPaymentInsertResult
            )}`
          )
        }
      }

      return { receiptBasic: receipt }
    })

    return transaction
  }
}
