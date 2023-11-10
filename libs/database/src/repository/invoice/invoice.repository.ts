import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { InvoiceItemType } from '_libs/database/common/variable'
import { Invoice } from '_libs/database/entities'
import { Between, EntityManager, FindOptionsWhere, In, IsNull } from 'typeorm'
import { InvoiceCondition, InvoiceOrder } from './invoice.dto'

@Injectable()
export class InvoiceRepository {
	constructor(@InjectEntityManager() private manager: EntityManager) { }

	getWhereOptions(condition: InvoiceCondition = {}) {
		const where: FindOptionsWhere<Invoice> = {}

		if (condition.id != null) where.id = condition.id
		if (condition.oid != null) where.oid = condition.oid
		if (condition.customerId != null) where.customerId = condition.customerId
		if (condition.arrivalId != null) where.arrivalId = condition.arrivalId
		if (condition.status != null) where.status = condition.status

		if (condition.ids) {
			if (condition.ids.length === 0) condition.ids.push(0)
			where.id = In(condition.ids)
		}
		if (condition.customerIds) {
			if (condition.customerIds.length === 0) condition.customerIds.push(0)
			where.customerId = In(condition.customerIds)
		}
		if (condition.arrivalIds) {
			if (condition.arrivalIds.length === 0) condition.arrivalIds.push(0)
			where.arrivalId = In(condition.arrivalIds)
		}
		if (condition.statuses) {
			if (condition.statuses.length === 0) condition.statuses.push(0)
			where.status = In(condition.statuses)
		}

		if (condition.createTime != null) {
			if (typeof condition.createTime === 'number') {
				where.createTime = condition.createTime
			}
			else if (Array.isArray(condition.createTime)) {
				if (condition.createTime[0] === 'BETWEEN') {
					where.createTime = Between(condition.createTime[1], condition.createTime[2])
				}
			}
		}

		if (condition.deleteTime != null) {
			if (typeof condition.deleteTime === 'number') {
				where.deleteTime = condition.deleteTime
			}
			else if (Array.isArray(condition.deleteTime)) {
				if (condition.deleteTime[0] === 'ISNULL') {
					where.deleteTime = IsNull()
				}
			}
		}

		return where
	}

	async pagination(options: {
		page: number,
		limit: number,
		condition?: InvoiceCondition,
		relation?: { customer?: boolean },
		order?: InvoiceOrder
	}) {
		const { limit, page, condition, relation, order } = options
		const where = this.getWhereOptions(condition)

		const [data, total] = await this.manager.findAndCount(Invoice, {
			relations: { customer: !!relation?.customer },
			relationLoadStrategy: 'query', // dùng join thì bị lỗi 2 câu query, bằng hòa
			where,
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async findOne(condition: InvoiceCondition, relation?: { customer: boolean }): Promise<Invoice> {
		const where = this.getWhereOptions(condition)

		const [invoice] = await this.manager.find(Invoice, {
			where,
			relations: { customer: !!relation?.customer },
			relationLoadStrategy: 'join',
		})
		return invoice
	}

	async findMany(
		condition: InvoiceCondition,
		relation?: { customer: boolean },
		limit?: number
	): Promise<Invoice[]> {
		const where = this.getWhereOptions(condition)

		const invoices = await this.manager.find(Invoice, {
			where,
			relations: { customer: !!relation?.customer },
			relationLoadStrategy: 'join',
			take: limit ? limit : undefined,
		})
		return invoices
	}

	async queryOneBy(condition: { id: number, oid: number }, relation?: {
		customer?: boolean,
		customerPayments?: boolean,
		invoiceItems?: { procedure?: boolean, productBatch?: { product?: boolean } }
	}): Promise<Invoice> {
		let query = this.manager.createQueryBuilder(Invoice, 'invoice')
			.where('invoice.id = :id', { id: condition.id })
			.andWhere('invoice.oid = :oid', { oid: condition.oid })

		if (relation?.customer) query = query.leftJoinAndSelect('invoice.customer', 'customer')
		if (relation?.customerPayments) query = query.leftJoinAndSelect('invoice.customerPayments', 'customerPayment')
		if (relation?.invoiceItems) query = query.leftJoinAndSelect('invoice.invoiceItems', 'invoiceItem')
		if (relation?.invoiceItems?.procedure) query = query.leftJoinAndSelect(
			'invoiceItem.procedure',
			'procedure',
			'invoiceItem.type = :typeProcedure',
			{ typeProcedure: InvoiceItemType.Procedure }
		)
		if (relation?.invoiceItems?.productBatch) {
			query = query.leftJoinAndSelect(
				'invoiceItem.productBatch',
				'productBatch',
				'invoiceItem.type = :typeProductBatch',
				{ typeProductBatch: InvoiceItemType.ProductBatch }
			)
		}
		if (relation?.invoiceItems?.productBatch?.product) {
			query = query.leftJoinAndSelect('productBatch.product', 'product')
		}

		const invoice = await query.getOne()
		return invoice
	}
}
