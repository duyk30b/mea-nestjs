import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../common/swagger'
import { OrganizationId } from '../../decorators/request.decorator'
import { ApiPurchaseService } from './api-purchase.service'
import { PurchaseGetOneQuery, PurchasePaginationQuery, ReceiptCreateBody, ReceiptUpdateBody } from './request'

@ApiTags('Purchase Order')
@ApiBearerAuth('access-token')
@Controller('purchase')
export class ApiPurchaseController {
	constructor(private readonly apiPurchaseService: ApiPurchaseService) { }

	@Get('pagination')
	async pagination(@OrganizationId() oid: number, @Query() query: PurchasePaginationQuery) {
		return this.apiPurchaseService.pagination(oid, query)
	}

	@Get('detail/:id')
	async detail(@OrganizationId() oid: number, @Param() { id }: IdParam, @Query() query: PurchaseGetOneQuery) {
		return this.apiPurchaseService.getOne(oid, +id, query)
	}

	@Post('create-receipt-draft')
	async createReceiptDraft(@OrganizationId() oid: number, @Body() body: ReceiptCreateBody) {
		return await this.apiPurchaseService.createReceiptDraft(oid, body)
	}

	@Post('create-receipt-draft-after-refund/:id')
	async createReceiptDraftAfterRefund(@OrganizationId() oid: number, @Param() { id }: IdParam, @Body() body: ReceiptCreateBody) {
		return await this.apiPurchaseService.createReceiptDraftAfterRefund(oid, id, body)
	}

	@Put('receipt/update-draft/:id')
	async updateReceiptDraft(@OrganizationId() oid: number, @Param() { id }: IdParam, @Body() body: ReceiptUpdateBody) {
		return await this.apiPurchaseService.updateReceiptDraft(oid, id, body)
	}

	@Patch('receipt/payment-draft/:id')
	async paymentReceiptDraft(@OrganizationId() oid: number, @Param() { id }: IdParam) {
		return await this.apiPurchaseService.paymentReceiptDraft(oid, id)
	}

	@Patch('receipt/refund/:id')
	async refund(@OrganizationId() oid: number, @Param() { id }: IdParam) {
		return await this.apiPurchaseService.refundReceipt(oid, id)
	}
}
