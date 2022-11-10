import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DebtType } from '_libs/database/common/variable'
import { Distributor, DistributorDebt } from '_libs/database/entities'
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm'
import { DistributorDebtCriteria, DistributorDebtOrder } from './distributor-debt.dto'

@Injectable()
export class DistributorDebtRepository {
	constructor(
		private dataSource: DataSource,
		@InjectRepository(DistributorDebt) private readonly distributorDebtRepository: Repository<DistributorDebt>
	) { }

	getWhereOptions(criteria: DistributorDebtCriteria = {}) {
		const where: FindOptionsWhere<DistributorDebt> = {}
		if (criteria.id != null) where.id = criteria.id
		if (criteria.oid != null) where.oid = criteria.oid
		if (criteria.distributorId != null) where.distributorId = criteria.distributorId

		if (criteria.ids) {
			if (criteria.ids.length === 0) criteria.ids.push(0)
			where.id = In(criteria.ids)
		}

		return where
	}

	async pagination(options: { page: number, limit: number, criteria?: DistributorDebtCriteria, order?: DistributorDebtOrder }) {
		const { limit, page, criteria, order } = options

		const [data, total] = await this.distributorDebtRepository.findAndCount({
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async findMany(criteria: DistributorDebtCriteria): Promise<DistributorDebt[]> {
		const where = this.getWhereOptions(criteria)
		return await this.distributorDebtRepository.find({ where })
	}

	async findOne(criteria: DistributorDebtCriteria): Promise<DistributorDebt> {
		const where = this.getWhereOptions(criteria)
		return await this.distributorDebtRepository.findOne({ where })
	}

	async startPayDebt(options: {
		oid: number,
		distributorId: number,
		money: number,
		createTime: number,
		note?: string
	}) {
		const { oid, distributorId, money, createTime, note } = options
		return await this.dataSource.transaction(async (manager) => {
			const updateDistributor = await manager.decrement<Distributor>(
				Distributor,
				{ id: distributorId, oid },
				'debt',
				money
			)
			if (updateDistributor.affected !== 1) {
				throw new Error(`Pay Debt failed: Update customer ${distributorId} invalid`)
			}

			const distributor = await manager.findOne(Distributor, { where: { oid, id: distributorId } })
			const openDebt = distributor.debt + money  // Trả lại số lượng ban đầu vì đã bị update trước đó

			const distributorDebtSnap = manager.create<DistributorDebt>(DistributorDebt, {
				oid,
				distributorId,
				type: DebtType.PayUp,
				createTime,
				openDebt,
				money: -money,
				closeDebt: openDebt - money,
				note,
			})
			const distributorDebt = await manager.save(distributorDebtSnap)

			return { distributor, distributorDebt }
		})
	}
}
