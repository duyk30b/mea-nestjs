import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DebtType } from '_libs/database/common/variable'
import { Customer, CustomerDebt } from '_libs/database/entities'
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm'
import { CustomerDebtCriteria, CustomerDebtOrder } from './customer-debt.dto'

@Injectable()
export class CustomerDebtRepository {
	constructor(
		private dataSource: DataSource,
		@InjectRepository(CustomerDebt) private readonly customerDebtRepository: Repository<CustomerDebt>
	) { }

	getWhereOptions(criteria: CustomerDebtCriteria = {}) {
		const where: FindOptionsWhere<CustomerDebt> = {}
		if (criteria.id != null) where.id = criteria.id
		if (criteria.oid != null) where.oid = criteria.oid
		if (criteria.customerId != null) where.customerId = criteria.customerId

		if (criteria.ids) {
			if (criteria.ids.length === 0) criteria.ids.push(0)
			where.id = In(criteria.ids)
		}

		return where
	}

	async pagination(options: {
		page: number,
		limit: number,
		criteria: CustomerDebtCriteria,
		order: CustomerDebtOrder
	}) {
		const { limit, page, criteria, order } = options

		const [data, total] = await this.customerDebtRepository.findAndCount({
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async findMany(criteria: CustomerDebtCriteria): Promise<CustomerDebt[]> {
		const where = this.getWhereOptions(criteria)
		return await this.customerDebtRepository.find({ where })
	}

	async findOne(criteria: CustomerDebtCriteria): Promise<CustomerDebt> {
		const where = this.getWhereOptions(criteria)
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
