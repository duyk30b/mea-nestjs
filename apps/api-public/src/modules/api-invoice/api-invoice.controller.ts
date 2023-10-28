import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../common/swagger'
import { External, TExternal } from '../../common/request-external'
import { ApiInvoiceService } from './api-invoice.service'
import { InvoiceCreateBody, InvoiceGetOneQuery, InvoicePaginationQuery, InvoicePaymentMoneyBody, InvoiceUpdateBody } from './request'

@ApiTags('Invoice')
@ApiBearerAuth('access-token')
@Controller('invoice')
export class ApiInvoiceController {
	constructor(private readonly apiInvoiceService: ApiInvoiceService) { }

	@Get('pagination')
	async pagination(@External() { oid }: TExternal, @Query() query: InvoicePaginationQuery) {
		return await this.apiInvoiceService.pagination(oid, query)
	}

	@Get('detail/:id')
	async detail(@External() { oid }: TExternal, @Param() { id }: IdParam, @Query() query: InvoiceGetOneQuery) {
		return await this.apiInvoiceService.getOne(oid, id, query)
	}

	@Post('create-draft')
	async createInvoiceDraft(@External() { oid }: TExternal, @Body() body: InvoiceCreateBody) {
		return await this.apiInvoiceService.createDraft({ oid, body })
	}

	@Patch('update-draft/:id')
	async updateInvoiceDraft(@External() { oid }: TExternal, @Param() { id }: IdParam, @Body() body: InvoiceUpdateBody) {
		return await this.apiInvoiceService.updateDraft({ oid, invoiceId: id, body })
	}

	@Delete('delete-draft/:id')
	async deleteInvoiceDraft(@External() { oid }: TExternal, @Param() { id }: IdParam) {
		return await this.apiInvoiceService.deleteDraft({ oid, invoiceId: id })
	}

	@Post('start-ship/:id')
	async startShip(@External() { oid }: TExternal, @Param() { id }: IdParam) {
		return await this.apiInvoiceService.startShip({
			oid,
			invoiceId: id,
			shipTime: Date.now(),
		})
	}

	@Post('start-payment/:id')
	async startPaymentInvoice(@External() { oid }: TExternal, @Param() { id }: IdParam, @Body() body: InvoicePaymentMoneyBody) {
		return await this.apiInvoiceService.startPayment({
			oid,
			invoiceId: id,
			debt: body.debt,
			paymentTime: Date.now(),
		})
	}

	@Post('start-ship-and-payment/:id')
	async startShipAndPayment(@External() { oid }: TExternal, @Param() { id }: IdParam, @Body() body: InvoicePaymentMoneyBody) {
		return await this.apiInvoiceService.startShipAndPayment({
			oid,
			invoiceId: id,
			debt: body.debt,
			time: Date.now(),
		})
	}

	@Post('start-refund/:id')
	async startRefund(@External() { oid }: TExternal, @Param() { id }: IdParam) {
		return await this.apiInvoiceService.startRefund({
			oid,
			invoiceId: id,
			refundTime: Date.now(),
		})
	}
}
