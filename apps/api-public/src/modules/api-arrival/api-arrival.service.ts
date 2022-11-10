import { Injectable } from '@nestjs/common'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { ArrivalInvoiceRepository, ArrivalRepository, CustomerRepository, InvoiceUpsertDto } from '_libs/database/repository'
import { ArrivalGetOneQuery, ArrivalPaginationQuery, InvoiceUpsertBody } from './request'

@Injectable()
export class ApiArrivalService {
	constructor(
		private readonly arrivalRepository: ArrivalRepository,
		private readonly arrivalInvoiceRepository: ArrivalInvoiceRepository,
		private readonly customerRepository: CustomerRepository
	) { }

	async pagination(oid: number, query: ArrivalPaginationQuery) {
		const { page, limit, total, data } = await this.arrivalRepository.pagination({
			page: query.page,
			limit: query.limit,
			criteria: {
				oid,
				customerId: query.filter?.customerId,
				fromTime: query.filter?.fromTime,
				toTime: query.filter?.toTime,
				types: query.filter?.types,
				paymentStatus: query.filter?.paymentStatus,
			},
			order: query.sort || { id: 'DESC' },
		})

		if (query.relations?.customer && data.length) {
			const customerIds = uniqueArray(data.map((i) => i.customerId))
			const customers = await this.customerRepository.findMany({ ids: customerIds })
			data.forEach((i) => i.customer = customers.find((j) => j.id === i.customerId))
		}
		return { page, limit, total, data }
	}

	async getOne(oid: number, id: number, { relations }: ArrivalGetOneQuery) {
		const arrival = await this.arrivalRepository.findOne({ id, oid }, {
			customer: !!relations?.customer,
			invoices: relations?.invoices && { invoiceItems: { procedure: true, productBatch: true } },
		})
		return arrival
	}

	async createInvoiceDraft(oid: number, customerId: number, body: InvoiceUpsertBody) {
		try {
			const data = await this.arrivalInvoiceRepository.createInvoiceDraft({
				oid,
				customerId,
				invoiceUpsertDto: InvoiceUpsertDto.from(body),
				time: Date.now(),
			})
			return { success: true, data }
		} catch (error: any) {
			return { success: false, message: error.message }
		}
	}

	async createInvoiceDraftAfterRefund(oid: number, arrivalId: number, body: InvoiceUpsertBody) {
		try {
			const data = await this.arrivalInvoiceRepository.createInvoiceDraftAfterRefund({
				oid,
				arrivalId,
				invoiceUpsertDto: InvoiceUpsertDto.from(body),
			})
			return { success: true, data }
		} catch (error: any) {
			return { success: false, message: error.message }
		}
	}

	async updateInvoiceDraft(oid: number, invoiceId: number, body: InvoiceUpsertBody) {
		try {
			const data = await this.arrivalInvoiceRepository.updateInvoiceDraft({
				oid,
				invoiceId,
				invoiceUpsertDto: InvoiceUpsertDto.from(body),
			})
			return { success: true, data }
		} catch (error: any) {
			return { success: false, message: error.message }
		}
	}

	async paymentInvoiceDraft(oid: number, invoiceId: number) {
		try {
			const data = await this.arrivalInvoiceRepository.paymentInvoiceDraft({
				oid,
				invoiceId,
				time: Date.now(),
			})
			return { success: true, data }
		} catch (error: any) {
			return { success: false, message: error.message }
		}
	}

	async refundInvoice(oid: number, invoiceId: number) {
		try {
			const data = await this.arrivalInvoiceRepository.refundInvoice({
				oid,
				invoiceId,
				time: Date.now(),
			})
			return { success: true, data }
		} catch (error: any) {
			return { success: false, message: error.message }
		}
	}
}
