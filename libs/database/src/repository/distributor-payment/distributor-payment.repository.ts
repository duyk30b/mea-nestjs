import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { formatNumber } from '_libs/common/helpers/string.helper'
import { PaymentType, ReceiptStatus } from '_libs/database/common/variable'
import { Distributor, DistributorPayment, Receipt } from '_libs/database/entities'
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm'
import { DistributorPaymentCondition, DistributorPaymentOrder } from './distributor-payment.dto'

@Injectable()
export class DistributorPaymentRepository {
	constructor(
		private dataSource: DataSource,
		@InjectRepository(DistributorPayment) private readonly distributorPaymentRepository: Repository<DistributorPayment>
	) { }

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
		page: number,
		limit: number,
		condition?: DistributorPaymentCondition,
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
		oid: number,
		distributorId: number,
		time: number,
		receiptPayments?: { receiptId: number, money: number }[],
		note?: string
	}) {
		const { oid, distributorId, time, receiptPayments, note } = options
		const receiptIds = receiptPayments.map((i) => i.receiptId)
		const totalMoney = receiptPayments.reduce((acc, cur) => acc + cur.money, 0)

		return await this.dataSource.transaction(async (manager) => {
			const distributor = await manager.findOne(
				Distributor,
				{ where: { oid, id: distributorId } }
			)
			if (!totalMoney || totalMoney > distributor.debt) {
				throw new Error(`Distributor ${distributorId} pay debt failed: Money number invalid`)
			}
			let openDebt = distributor.debt

			const updateDistributor = await manager.decrement<Distributor>(
				Distributor,
				{ id: distributorId, oid },
				'debt',
				totalMoney
			)
			if (updateDistributor.affected !== 1) {
				throw new Error(`Distributor ${distributorId} pay debt failed: Update distributor invalid`)
			}

			const receiptList = await manager.find(
				Receipt,
				{ where: { oid, id: In(receiptIds) } }
			)
			if (receiptList.length !== receiptIds.length) {
				throw new Error(`Distributor ${distributorId} pay debt failed: receiptList.length != receiptIds.length`)
			}

			const distributorPaymentListDto: DistributorPayment[] = []

			// Trả nợ vào từng đơn
			for (let i = 0; i < receiptList.length; i++) {
				const receipt = receiptList[i]
				const money = receiptPayments.find((item) => item.receiptId === receipt.id)?.money
				if (![ReceiptStatus.Debt].includes(receipt.status)) {
					throw new Error(`Distributor ${distributorId} pay debt failed: Status Receipt ${receipt.id} invalid`)
				}
				if (!money || money < 0 || money > receipt.debt) {
					throw new Error(`Distributor ${distributorId} pay debt failed: Money for receiptId ${receipt.id} invalid`)
				}

				const distributorPaymentDto = manager.create(DistributorPayment, {
					oid,
					distributorId,
					receiptId: receipt.id,
					time,
					type: PaymentType.PayDebt,
					paid: money,
					openDebt,
					debit: -money,
					closeDebt: openDebt - money,
					note,
					description: receiptPayments.length > 1
						? `Trả ${formatNumber(totalMoney)} vào ${receiptPayments.length} đơn nợ: ${JSON.stringify(receiptIds)}`
						: undefined,
				})
				openDebt = openDebt - money
				distributorPaymentListDto.push(distributorPaymentDto)

				const receiptUpdateResult = await manager.update(Receipt, { id: receipt.id }, {
					status: money === receipt.debt ? ReceiptStatus.Success : ReceiptStatus.Debt,
					debt: receipt.debt - money,
					paid: receipt.paid + money,
				})
				if (receiptUpdateResult.affected !== 1) {
					throw new Error(`Distributor ${distributorId} pay debt failed: Update Receipt ${receipt.id} failed`)
				}
			}
			await this.distributorPaymentRepository.insert(distributorPaymentListDto)
			return { distributorId }
		})
	}
}
