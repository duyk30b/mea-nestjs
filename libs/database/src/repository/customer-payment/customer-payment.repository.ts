import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { InvoiceStatus, PaymentType } from '_libs/database/common/variable'
import { Customer, CustomerPayment, Invoice } from '_libs/database/entities'
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm'
import { CustomerPaymentCondition, CustomerPaymentOrder } from './customer-payment.dto'
import { formatNumber } from '_libs/common/helpers/string.helper'

@Injectable()
export class CustomerPaymentRepository {
	constructor(
		private dataSource: DataSource,
		@InjectRepository(CustomerPayment) private readonly customerDebtRepository: Repository<CustomerPayment>
	) { }

	getWhereOptions(condition: CustomerPaymentCondition = {}) {
		const where: FindOptionsWhere<CustomerPayment> = {}
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
		condition: CustomerPaymentCondition,
		order: CustomerPaymentOrder
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

	async findMany(condition: CustomerPaymentCondition): Promise<CustomerPayment[]> {
		const where = this.getWhereOptions(condition)
		return await this.customerDebtRepository.find({ where })
	}

	async findOne(condition: CustomerPaymentCondition): Promise<CustomerPayment> {
		const where = this.getWhereOptions(condition)
		return await this.customerDebtRepository.findOne({ where })
	}

	async startPayDebt(options: {
		oid: number,
		customerId: number,
		time: number,
		invoicePayments?: { invoiceId: number, money: number }[],
		note?: string
	}) {
		const { oid, customerId, invoicePayments, time, note } = options
		const invoiceIds = invoicePayments.map((i) => i.invoiceId)
		const totalMoney = invoicePayments.reduce((acc, cur) => acc + cur.money, 0)

		return await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
			const customer = await manager.findOne(
				Customer,
				{ where: { oid, id: customerId } }
			)
			if (!totalMoney || totalMoney > customer.debt) {
				throw new Error(`Customer ${customerId} pay debt failed: Money number invalid`)
			}
			let openDebt = customer.debt

			const updateCustomer = await manager.decrement<Customer>(
				Customer,
				{ id: customerId, oid },
				'debt',
				totalMoney
			)
			if (updateCustomer.affected !== 1) {
				throw new Error(`Customer ${customerId} pay debt failed: Update customer invalid`)
			}

			const invoiceList = await manager.find(
				Invoice,
				{ where: { oid, id: In(invoiceIds) } }
			)
			if (invoiceList.length !== invoiceIds.length) {
				throw new Error(`Customer ${customerId} pay debt failed: invoiceList.length != invoiceIds.length`)
			}

			const customerPaymentListDto: CustomerPayment[] = []

			// Trả nợ vào từng đơn
			for (let i = 0; i < invoiceList.length; i++) {
				const invoice = invoiceList[i]
				const money = invoicePayments.find((item) => item.invoiceId === invoice.id)?.money
				if (![InvoiceStatus.Debt].includes(invoice.status)) {
					throw new Error(`Customer ${customerId} pay debt failed: Status Invoice ${invoice.id} invalid`)
				}
				if (!money || money < 0 || money > invoice.debt) {
					throw new Error(`Customer ${customerId} pay debt failed: Money for invoiceId ${invoice.id} invalid`)
				}

				const customerPaymentDto = manager.create(CustomerPayment, {
					oid,
					customerId,
					invoiceId: invoice.id,
					time,
					type: PaymentType.PayDebt,
					paid: money,
					openDebt,
					debit: -money,
					closeDebt: openDebt - money,
					note,
					description: invoicePayments.length > 1
						? `Trả ${formatNumber(totalMoney)} vào ${invoicePayments.length} đơn nợ: ${JSON.stringify(invoiceIds)}`
						: undefined,
				})
				openDebt = openDebt - money
				customerPaymentListDto.push(customerPaymentDto)

				const invoiceUpdateResult = await manager.update(Invoice, { id: invoice.id }, {
					status: money === invoice.debt ? InvoiceStatus.Success : InvoiceStatus.Debt,
					debt: invoice.debt - money,
					paid: invoice.paid + money,
				})
				if (invoiceUpdateResult.affected !== 1) {
					throw new Error(`Customer ${customerId} pay debt failed: Update Invoice ${invoice.id} failed`)
				}
			}

			await this.customerDebtRepository.insert(customerPaymentListDto)

			return { customerId }
		})
	}
}
