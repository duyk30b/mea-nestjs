import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InvoiceInsertDto, InvoiceQuickRepository, InvoiceRepository, InvoiceUpdateDto } from '_libs/database/repository'
import { InvoiceCreateBody, InvoiceGetOneQuery, InvoicePaginationQuery, InvoiceUpdateBody } from './request'

@Injectable()
export class ApiInvoiceService {
	constructor(
		private readonly invoiceRepository: InvoiceRepository,
		private readonly invoiceQuickRepository: InvoiceQuickRepository
	) { }

	async pagination(oid: number, query: InvoicePaginationQuery) {
		const { fromTime, toTime, customerId } = query.filter || {}

		return await this.invoiceRepository.pagination({
			page: query.page,
			limit: query.limit,
			condition: {
				oid,
				customerId,
				status: query.filter?.status,
				createTime: fromTime != null && toTime != null ? ['BETWEEN', fromTime, toTime] : undefined,
			},
			relation: { customer: query.relation?.customer },
			order: query.sort || { id: 'DESC' },
		})
	}

	async getOne(oid: number, id: number, { relation }: InvoiceGetOneQuery) {
		return await this.invoiceRepository.queryOneBy({ oid, id }, {
			customer: !!relation?.customer,
			invoiceItems: relation?.invoiceItems && { procedure: true, productBatch: { product: true } },
		})
	}

	async createDraft(params: { oid: number, body: InvoiceCreateBody }) {
		const { oid, body } = params
		try {
			return await this.invoiceQuickRepository.createDraft({
				oid,
				invoiceInsertDto: InvoiceInsertDto.from(body),
			})
		} catch (error: any) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async updateDraft(params: { oid: number, invoiceId: number, body: InvoiceUpdateBody }) {
		const { oid, invoiceId, body } = params
		try {
			return await this.invoiceQuickRepository.updateDraft({
				oid,
				invoiceId,
				invoiceUpdateDto: InvoiceUpdateDto.from(body),
			})
		} catch (error: any) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async deleteDraft(params: { oid: number, invoiceId: number }) {
		const { oid, invoiceId } = params
		try {
			await this.invoiceQuickRepository.deleteDraft({ oid, invoiceId })
			return { success: true }
		} catch (error: any) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async startShip(params: { oid: number, invoiceId: number, shipTime: number }) {
		const { oid, invoiceId, shipTime } = params
		try {
			await this.invoiceQuickRepository.startShip({ oid, invoiceId, shipTime })
			return { success: true }
		} catch (error: any) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async startPayment(params: { oid: number, invoiceId: number, paymentTime: number, debt: number }) {
		const { oid, invoiceId, paymentTime, debt } = params
		try {
			await this.invoiceQuickRepository.startPayment({ oid, invoiceId, paymentTime, debt })
			return { success: true }
		} catch (error: any) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async startShipAndPayment(options: { oid: number, invoiceId: number, time: number, debt: number }) {
		const { oid, invoiceId, debt, time } = options
		try {
			await this.invoiceQuickRepository.startShip({ oid, invoiceId, shipTime: time })
			await this.invoiceQuickRepository.startPayment({ oid, invoiceId, paymentTime: time, debt })
			return { success: true }
		} catch (error: any) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async startRefund(params: { oid: number, invoiceId: number, refundTime: number }) {
		const { oid, invoiceId, refundTime } = params
		try {
			await this.invoiceQuickRepository.startRefund({ oid, invoiceId, refundTime })
			return { success: true }
		} catch (error: any) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}
}
