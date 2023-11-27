import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { formatNumber } from '_libs/common/helpers/string.helper'
import { PaymentType, ReceiptStatus } from '_libs/database/common/variable'
import { Distributor, DistributorPayment, Receipt } from '_libs/database/entities'
import { DataSource, FindOptionsWhere, In, MoreThanOrEqual, Repository } from 'typeorm'
import { DistributorPaymentCondition, DistributorPaymentOrder } from './distributor-payment.dto'

@Injectable()
export class DistributorPaymentRepository {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(DistributorPayment)
        private readonly distributorPaymentRepository: Repository<DistributorPayment>
    ) {}

    getWhereOptions(condition: DistributorPaymentCondition = {}) {
        const where: FindOptionsWhere<DistributorPayment> = {}
        if (condition.id != null) where.id = condition.id
        if (condition.oid != null) where.oid = condition.oid
        if (condition.distributorId != null) where.distributorId = condition.distributorId

        if (condition.ids) {
            if (condition.ids.length === 0) condition.ids.push(0)
            where.id = In(condition.ids)
        }

        return where
    }

    async pagination(options: {
        page: number
        limit: number
        condition?: DistributorPaymentCondition
        order?: DistributorPaymentOrder
    }) {
        const { limit, page, condition, order } = options

        const [data, total] = await this.distributorPaymentRepository.findAndCount({
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        })

        return { total, page, limit, data }
    }

    async findMany(condition: DistributorPaymentCondition): Promise<DistributorPayment[]> {
        const where = this.getWhereOptions(condition)
        return await this.distributorPaymentRepository.find({ where })
    }

    async findOne(condition: DistributorPaymentCondition): Promise<DistributorPayment> {
        const where = this.getWhereOptions(condition)
        return await this.distributorPaymentRepository.findOne({ where })
    }

    async startPayDebt(options: {
        oid: number
        distributorId: number
        time: number
        receiptPayments?: { receiptId: number; money: number }[]
        note?: string
    }) {
        const { oid, distributorId, receiptPayments, time, note } = options
        if (!receiptPayments.length || receiptPayments.some((item) => (item.money || 0) <= 0)) {
            throw new Error(`Distributor ${distributorId} pay debt failed: Money number invalid`)
        }

        const receiptIds = receiptPayments.map((i) => i.receiptId)
        const totalMoney = receiptPayments.reduce((acc, cur) => acc + cur.money, 0)

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
            const distributorPaymentListDto: DistributorPayment[] = []

            for (let i = 0; i < receiptIds.length; i++) {
                const receiptId = receiptIds[i] || 0
                const money = receiptPayments.find((item) => item.receiptId === receiptId)?.money

                // Trả nợ vào từng đơn
                const receiptUpdateResult = await manager.update(
                    Receipt,
                    {
                        id: receiptId,
                        oid,
                        status: ReceiptStatus.Debt,
                        debt: MoreThanOrEqual(money),
                    },
                    {
                        status: () => `IF(debt = ${money}, ${ReceiptStatus.Success}, ${ReceiptStatus.Debt})`,
                        debt: () => `debt - ${money}`,
                        paid: () => `paid + ${money}`,
                    }
                )
                if (receiptUpdateResult.affected !== 1) {
                    throw new Error(`Distributor ${distributorId} pay debt failed: Update Receipt ${receiptId} failed`)
                }
                const receipt = await manager.findOne(Receipt, { where: { oid, id: receiptId } })
                const receiptOpenDebt = receipt.debt + money

                const distributorPaymentDto = manager.create(DistributorPayment, {
                    oid,
                    distributorId,
                    receiptId,
                    time,
                    type: PaymentType.PayDebt,
                    paid: money,
                    debit: -money,
                    distributorOpenDebt,
                    distributorCloseDebt: distributorOpenDebt - money,
                    receiptOpenDebt,
                    receiptCloseDebt: receiptOpenDebt - money,
                    note,
                    description:
                        receiptPayments.length > 1
                            ? `Trả ${formatNumber(totalMoney)} vào ${receiptPayments.length} phiếu nợ: ${JSON.stringify(
                                receiptIds
                            )}`
                            : undefined,
                })
                distributorOpenDebt = distributorOpenDebt - money
                distributorPaymentListDto.push(distributorPaymentDto)
            }

            await this.distributorPaymentRepository.insert(distributorPaymentListDto)

            return { distributorId }
        })
    }
}
