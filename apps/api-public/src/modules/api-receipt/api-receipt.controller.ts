import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { Body, Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../common/swagger'
import { External, TExternal } from '../../common/request-external'
import { ApiReceiptService } from './api-receipt.service'
import { ReceiptCreateBody, ReceiptGetOneQuery, ReceiptPaginationQuery, ReceiptUpdateBody } from './request'

@ApiTags('Receipt')
@ApiBearerAuth('access-token')
@Controller('receipt')
export class ApiReceiptController {
	constructor(private readonly apiReceiptService: ApiReceiptService) { }

	@Get('pagination')
	async pagination(@External() { oid }: TExternal, @Query() query: ReceiptPaginationQuery) {
		return await this.apiReceiptService.pagination(oid, query)
	}

	@Get('detail/:id')
	async detail(@External() { oid }: TExternal, @Param() { id }: IdParam, @Query() query: ReceiptGetOneQuery) {
		return await this.apiReceiptService.getOne(oid, id, query)
	}

	@Post('create-draft')
	async createDraft(@External() { oid }: TExternal, @Body() body: ReceiptCreateBody) {
		return await this.apiReceiptService.createDraft({ oid, body })
	}

	@Patch('update-draft/:id')
	async updateDraft(@External() { oid }: TExternal, @Param() { id }: IdParam, @Body() body: ReceiptUpdateBody) {
		return await this.apiReceiptService.updateDraft({ oid, receiptId: id, body })
	}

	@Delete('delete-draft/:id')
	async deleteDraft(@External() { oid }: TExternal, @Param() { id }: IdParam) {
		return await this.apiReceiptService.deleteDraft({ oid, receiptId: id })
	}

	@Post('start-ship-and-payment/:id')
	async startShipAndPayment(@External() { oid }: TExternal, @Param() { id }: IdParam) {
		return await this.apiReceiptService.startShipAndPayment({
			oid,
			receiptId: id,
			shipTime: Date.now(),
		})
	}

	@Post('start-refund/:id')
	async startRefund(@External() { oid }: TExternal, @Param() { id }: IdParam) {
		return await this.apiReceiptService.startRefund({
			oid,
			receiptId: id,
			refundTime: Date.now(),
		})
	}
}
