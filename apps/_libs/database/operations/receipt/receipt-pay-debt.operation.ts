import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, Raw, UpdateResult } from 'typeorm'
import { PaymentType, ReceiptStatus } from '../../common/variable'
import { Distributor, DistributorPayment, Receipt } from '../../entities'
import { DistributorPaymentInsertType } from '../../entities/distributor-payment.entity'

@Injectable()
export class ReceiptPayDebtOperation {
  constructor(private dataSource: DataSource) {}

  async payDebt(params: { oid: number; receiptId: number; time: number; money: number }) {
    const { oid, receiptId, time, money } = params
    const PREFIX = `ReceiptId=${receiptId} pay debt failed`

    if (money <= 0) {
      throw new Error(`${PREFIX}: money=${money}`)
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE INVOICE ===
      const whereReceipt: FindOptionsWhere<Receipt> = {
        oid,
        id: receiptId,
        status: ReceiptStatus.Debt,
        totalMoney: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
      }
      const receiptUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Receipt)
        .where(whereReceipt)
        .set({
          status: () => `CASE 
                            WHEN("totalMoney" - paid = ${money}) THEN ${ReceiptStatus.Success} 
                            ELSE ${ReceiptStatus.Debt}
                            END
                        `,
          debt: () => `debt - ${money}`,
          paid: () => `paid + ${money}`,
        })
        .returning('*')
        .execute()
      if (receiptUpdateResult.affected !== 1) {
        throw new Error(`${PREFIX}: Update Receipt failed`)
      }
      const receipt = Receipt.fromRaw(receiptUpdateResult.raw[0])

      // === 2. UPDATE DISTRIBUTOR ===
      const whereDistributor: FindOptionsWhere<Distributor> = { id: receipt.distributorId }
      const distributorUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Distributor)
        .where(whereDistributor)
        .set({
          debt: () => `debt - ${money}`,
        })
        .returning('*')
        .execute()
      if (distributorUpdateResult.affected !== 1) {
        throw new Error(`${PREFIX}: distributorId=${receipt.distributorId} update failed`)
      }
      const distributor = Distributor.fromRaw(distributorUpdateResult.raw[0])

      const distributorCloseDebt = distributor.debt
      const distributorOpenDebt = distributorCloseDebt + money

      // === 3. INSERT DISTRIBUTOR_PAYMENT ===
      const distributorPaymentDraft: DistributorPaymentInsertType = {
        oid,
        distributorId: receipt.distributorId,
        receiptId,
        createdAt: time,
        paymentType: PaymentType.PayDebt,
        paid: money,
        debit: -money,
        openDebt: distributorOpenDebt,
        closeDebt: distributorCloseDebt,
        note: '',
        description: '',
      }
      const distributorPaymentInsertResult = await manager.insert(
        DistributorPayment,
        distributorPaymentDraft
      )

      const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
      if (!distributorPaymentId) {
        throw new Error(
          `${PREFIX}: Insert DistributorPayment failed: `
            + `${JSON.stringify(distributorPaymentInsertResult)}`
        )
      }

      return { distributor, receiptBasic: receipt }
    })

    return transaction
  }
}
