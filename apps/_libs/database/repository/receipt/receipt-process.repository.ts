import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager, In, IsNull, Raw } from 'typeorm'
import { PaymentType, ReceiptStatus } from '../../common/variable'
import { Distributor, DistributorPayment, Receipt, ReceiptItem } from '../../entities'
import { ReceiptInsertDto, ReceiptUpdateDto } from './receipt.dto'

@Injectable()
export class ReceiptProcessRepository {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager
  ) {}

  async createDraft(params: { oid: number; receiptInsertDto: ReceiptInsertDto }) {
    const { oid, receiptInsertDto } = params
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const receiptDraft = manager.create(Receipt, receiptInsertDto)
      receiptDraft.oid = oid
      receiptDraft.status = ReceiptStatus.Draft
      receiptDraft.paid = 0
      receiptDraft.debt = 0

      const receiptResult = await manager.insert(Receipt, receiptDraft)
      const receiptId = receiptResult.identifiers?.[0]?.id
      if (!receiptId) {
        throw new Error(`Create Receipt failed: Insert error ${JSON.stringify(receiptResult)}`)
      }

      const receiptItemsEntity = manager.create(ReceiptItem, receiptInsertDto.receiptItems)
      receiptItemsEntity.forEach((item) => {
        item.oid = oid
        item.receiptId = receiptId
        item.distributorId = receiptInsertDto.distributorId
      })
      await manager.insert(ReceiptItem, receiptItemsEntity)

      return { receiptId }
    })
  }

  async updateDraft(params: {
    oid: number
    receiptId: number
    receiptUpdateDto: ReceiptUpdateDto
  }) {
    const { oid, receiptId, receiptUpdateDto } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const { receiptItems, ...receiptDraft } = manager.create(Receipt, receiptUpdateDto)
      receiptDraft.paid = 0
      receiptDraft.debt = 0
      const receiptUpdateResult = await manager.update(
        Receipt,
        {
          id: receiptId,
          oid,
          status: ReceiptStatus.Draft,
        },
        receiptDraft
      )
      if (receiptUpdateResult.affected !== 1) {
        throw new Error(`Update Receipt ${receiptId} failed: Status invalid`)
      }

      const receipt = await manager.findOneBy(Receipt, { id: receiptId, oid })

      await manager.delete(ReceiptItem, { oid, receiptId })
      const receiptItemsEntity = manager.create(ReceiptItem, receiptUpdateDto.receiptItems)
      receiptItemsEntity.forEach((item) => {
        item.oid = oid
        item.receiptId = receiptId
        item.distributorId = receipt.distributorId
      })
      await manager.insert(ReceiptItem, receiptItemsEntity)

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

  async prepayment(params: { oid: number; receiptId: number; time: number; money: number }) {
    const { oid, receiptId, time, money } = params
    if (money < 0) {
      throw new Error(`Prepayment Receipt ${receiptId} failed: Money number invalid`)
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const receiptUpdateResult = await manager.getRepository(Receipt).update(
        {
          id: receiptId,
          oid,
          status: In([ReceiptStatus.Draft, ReceiptStatus.AwaitingShipment]),
          revenue: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
        },
        {
          status: ReceiptStatus.AwaitingShipment,
          paid: () => `paid + ${money}`,
          debt: 0, // thanh toán trước nên không tính là nợ
        }
      )
      if (receiptUpdateResult.affected !== 1) {
        throw new Error(`Prepayment Receipt ${receiptId} failed`)
      }

      const receipt = await manager.findOne(Receipt, { where: { oid, id: receiptId } })

      // Lưu lịch sử trả tiền
      if (money > 0) {
        const distributor = await manager.findOneBy(Distributor, {
          oid,
          id: receipt.distributorId,
        })
        const distributorCloseDebt = distributor.debt
        const distributorOpenDebt = distributor.debt
        const distributorPaymentInsertResult = await manager.insert(DistributorPayment, {
          oid,
          distributorId: receipt.distributorId,
          receiptId,
          createdAt: time,
          type: PaymentType.Prepayment,
          paid: money,
          debit: 0, // prepayment không phát sinh nợ
          distributorOpenDebt,
          distributorCloseDebt,
          receiptOpenDebt: 0,
          receiptCloseDebt: 0,
        })
        const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
        if (!distributorPaymentId) {
          throw new Error(
            `Create DistributorPayment failed: Insert error ${JSON.stringify(
              distributorPaymentInsertResult
            )}`
          )
        }
      }
    })
  }

  async payDebt(params: { oid: number; receiptId: number; time: number; money: number }) {
    const { oid, receiptId, time, money } = params
    if (money <= 0) {
      throw new Error(`Pay Debt Receipt ${receiptId} failed: Money number invalid`)
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const receiptUpdateResult = await manager.getRepository(Receipt).update(
        {
          id: receiptId,
          oid,
          status: ReceiptStatus.Debt,
          revenue: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
        },
        {
          status: () => `CASE 
                            WHEN(revenue - paid = ${money}) THEN ${ReceiptStatus.Success} 
                            ELSE ${ReceiptStatus.Debt}
                            END
                        `,
          debt: () => `debt - ${money}`,
          paid: () => `paid + ${money}`,
        }
      )
      if (receiptUpdateResult.affected !== 1) {
        throw new Error(`Payment Receipt ${receiptId} failed: Update failed`)
      }

      const [receipt] = await manager.find(Receipt, {
        relations: { receiptItems: true },
        relationLoadStrategy: 'join',
        where: { oid, id: receiptId },
      })

      // Trừ nợ khách hàng
      const updateDistributor = await manager.decrement<Distributor>(
        Distributor,
        { id: receipt.distributorId },
        'debt',
        money
      )
      if (updateDistributor.affected !== 1) {
        throw new Error(
          `Refund Receipt ${receiptId} failed: Update distributor ${receipt.distributorId} invalid`
        )
      }
      const distributor = await manager.findOneBy(Distributor, {
        oid,
        id: receipt.distributorId,
      })

      const distributorCloseDebt = distributor.debt
      const distributorOpenDebt = distributorCloseDebt + money
      const receiptCloseDebt = receipt.debt
      const receiptOpenDebt = receiptCloseDebt + money

      // Lưu lịch sử trả tiền
      const distributorPaymentInsertResult = await manager.insert(DistributorPayment, {
        oid,
        distributorId: receipt.distributorId,
        receiptId,
        createdAt: time,
        type: PaymentType.PayDebt,
        paid: money,
        debit: -money,
        distributorOpenDebt,
        distributorCloseDebt,
        receiptOpenDebt,
        receiptCloseDebt,
      })

      const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
      if (!distributorPaymentId) {
        throw new Error(
          `Create DistributorPayment failed: ` +
            `Insert error ${JSON.stringify(distributorPaymentInsertResult)}`
        )
      }
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
