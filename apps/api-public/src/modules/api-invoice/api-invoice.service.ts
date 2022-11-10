import { Injectable } from '@nestjs/common'
import { InvoiceRepository } from '_libs/database/repository'
import { InvoiceGetOneQuery, InvoicePaginationQuery } from './request'

@Injectable()
export class ApiInvoiceService {
	constructor(private readonly invoiceRepository: InvoiceRepository) { }

	async pagination(oid: number, query: InvoicePaginationQuery) {
		return await this.invoiceRepository.pagination({
			page: query.page,
			limit: query.limit,
			criteria: {
				oid,
				customerId: query.filter?.customerId,
				fromTime: query.filter?.fromTime,
				toTime: query.filter?.toTime,
				paymentStatus: query.filter?.paymentStatus,
			},
			relations: { customer: query.relations?.customer },
			order: query.sort || { id: 'DESC' },
		})
	}

	async getOne(oid: number, id: number, { relations }: InvoiceGetOneQuery) {
		return await this.invoiceRepository.queryOneBy({ oid, id }, {
			customer: !!relations?.customer,
			invoiceItems: relations?.invoiceItems && { procedure: true, productBatch: { product: true } },
		})
	}
}
