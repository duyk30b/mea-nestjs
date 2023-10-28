import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DebtType } from '_libs/database/common/variable'
import { Customer, CustomerDebt } from '_libs/database/entities'
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm'
import { CustomerDebtCondition, CustomerDebtOrder } from './customer-debt.dto'

@Injectable()
export class CustomerDebtRepository {
	constructor(
		private dataSource: DataSource,
		@InjectRepository(CustomerDebt) private readonly customerDebtRepository: Repository<CustomerDebt>
	) { }

	getWhereOptions(condition: CustomerDebtCondition = {}) {
		const where: FindOptionsWhere<CustomerDebt> = {}
		if (condition.id != null) where.id = condition.id
		if (condition.oid != null) where.oid = condition.oid
		if (condition.customerId != null) where.customerId = condition.customerId

		if (condition.ids) {
			if (condition.ids.length === 0) condition.ids.push(0)
			where.id = In(condition.ids)
		}

		return where
	}

	async pagination(options: {
		page: number,
		limit: number,
		condition: CustomerDebtCondition,
		order: CustomerDebtOrder
	}) {
		const { limit, page, condition, order } = options

		const [data, total] = await this.customerDebtRepository.findAndCount({
			where: this.getWhereOptions(condition),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async findMany(condition: CustomerDebtCondition): Promise<CustomerDebt[]> {
		const where = this.getWhereOptions(condition)
		return await this.customerDebtRepository.find({ where })
	}

	async findOne(condition: CustomerDebtCondition): Promise<CustomerDebt> {
		const where = this.getWhereOptions(condition)
		return await this.customerDebtRepository.findOne({ where })
	}

	async startPayDebt(options: {
		oid: number,
		customerId: number,
		money: number,
		createTime: number,
		note?: string
	}) {
		const { oid, customerId, money, createTime, note } = options
		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const updateCustomer = await manager.decrement<Customer>(
				Customer,
				{ id: customerId },
				'debt',
				money
			)
			if (updateCustomer.affected !== 1) {
				throw new Error(`Pay Debt failed: Update customer ${customerId} invalid`)
			}

			const customer = await manager.findOne(Customer, { where: { oid, id: customerId } })
			const openDebt = customer.debt + money                // Trả lại số lượng ban đầu vì đã bị update trước đó

			const customerDebtDto = manager.create<CustomerDebt>(CustomerDebt, {
				oid,
				customerId,
				type: DebtType.PayUp,
				createTime,
				openDebt,
				money: -money,
				closeDebt: openDebt - money,
				note,
			})
			const customerDebt = await manager.save(customerDebtDto)

			return { customer, customerDebt }
		})
	}
}
