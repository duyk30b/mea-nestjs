import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm'
import { formatNumber } from '../../common/helpers/string.helper'
import { PaymentType, ReceiptStatus } from '../common/variable'
import { Distributor, DistributorPayment, Receipt } from '../entities'
import {
  DistributorPaymentInsertType,
  DistributorPaymentRelationType,
  DistributorPaymentSortType,
  DistributorPaymentUpdateType,
} from '../entities/distributor-payment.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class DistributorPaymentRepository extends _PostgreSqlRepository<
  DistributorPayment,
  DistributorPaymentRelationType,
  DistributorPaymentInsertType,
  DistributorPaymentUpdateType,
  DistributorPaymentSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(DistributorPayment)
    private readonly distributorPaymentRepository: Repository<DistributorPayment>
  ) {
    super(DistributorPayment, distributorPaymentRepository)
  }

  async startPayDebt(options: {
    oid: number
    distributorId: number
    paymentMethodId: number
    time: number
    receiptPaymentList?: { receiptId: number; money: number }[]
    note?: string
  }) {
    const { oid, distributorId, paymentMethodId, receiptPaymentList, time, note } = options
    if (!receiptPaymentList.length || receiptPaymentList.some((item) => (item.money || 0) <= 0)) {
      throw new Error(`Distributor ${distributorId} pay debt failed: Money number invalid`)
    }

    const receiptIds = receiptPaymentList.map((i) => i.receiptId)
    const totalMoney = receiptPaymentList.reduce((acc, cur) => acc + cur.money, 0)

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // Update distributor trước để lock
      const updateDistributorResult = await manager.decrement<Distributor>(
        Distributor,
        {
          id: distributorId,
          oid,
          debt: MoreThanOrEqual(totalMoney),
        },
        'debt',
        totalMoney
      )
      if (updateDistributorResult.affected !== 1) {
        throw new Error(`Distributor ${distributorId} pay debt failed: Update distributor invalid`)
      }

      const distributor = await manager.findOne(Distributor, {
        where: { oid, id: distributorId },
      })
      let distributorOpenDebt = distributor.debt + totalMoney
      const distributorPaymentListDto: DistributorPaymentInsertType[] = []

      for (let i = 0; i < receiptIds.length; i++) {
        const receiptId = receiptIds[i] || 0
        const money = receiptPaymentList.find((item) => item.receiptId === receiptId)?.money

        // Trả nợ vào từng đơn
        const receiptUpdateResult = await manager.update(
          Receipt,
          {
            id: receiptId,
            distributorId,
            oid,
            status: ReceiptStatus.Debt,
            debt: MoreThanOrEqual(money),
          },
          {
            status: () => `CASE 
                                WHEN(debt = ${money}) THEN ${ReceiptStatus.Success} 
                                ELSE ${ReceiptStatus.Debt}
                                END
                            `,
            debt: () => `debt - ${money}`,
            paid: () => `paid + ${money}`,
          }
        )
        if (receiptUpdateResult.affected !== 1) {
          throw new Error(
            `Distributor ${distributorId} pay debt failed: Update Receipt ${receiptId} failed`
          )
        }

        const distributorPaymentDto: DistributorPaymentInsertType = {
          oid,
          distributorId,
          receiptId,
          paymentMethodId,
          createdAt: time,
          paymentType: PaymentType.PayDebt,
          paid: money,
          debit: -money,
          openDebt: distributorOpenDebt,
          closeDebt: distributorOpenDebt - money,
          note,
          description:
            receiptPaymentList.length > 1
              ? `Trả ${formatNumber(totalMoney)} vào ${receiptPaymentList.length} phiếu nợ: `
              + `${JSON.stringify(receiptIds)}`
              : '',
        }
        distributorOpenDebt = distributorOpenDebt - money
        distributorPaymentListDto.push(distributorPaymentDto)
      }

      await manager.insert(DistributorPayment, distributorPaymentListDto)

      return { distributorId }
    })
  }
}
