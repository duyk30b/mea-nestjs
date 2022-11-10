import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common'
import { Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../common/swagger'
import { TUserReq, UserReq } from '../../decorators/request.decorator'
import { ApiArrivalService } from './api-arrival.service'
import { ArrivalGetOneQuery, ArrivalPaginationQuery, InvoiceCreateQuery, InvoiceUpsertBody } from './request'

@ApiTags('Arrival')
@ApiBearerAuth('access-token')
@Controller('arrival')
export class ApiArrivalController {
	constructor(private readonly apiArrivalService: ApiArrivalService) { }

	@Get('pagination')
	async pagination(@UserReq() userReq: TUserReq, @Query() query: ArrivalPaginationQuery) {
		return await this.apiArrivalService.pagination(userReq.oid, query)
	}

	@Get('detail/:id')
	async detail(@UserReq() userReq: TUserReq, @Param() { id }: IdParam, @Query() query: ArrivalGetOneQuery) {
		return await this.apiArrivalService.getOne(userReq.oid, id, query)
	}

	@Post('create-invoice-draft')
	async createInvoiceDraft(@UserReq() userReq: TUserReq, @Query() query: InvoiceCreateQuery, @Body() body: InvoiceUpsertBody) {
		return await this.apiArrivalService.createInvoiceDraft(userReq.oid, query.customerId, body)
	}

	@Post('create-invoice-draft-after-refund/:id')
	async createInvoiceDraftAfterRefund(@UserReq() userReq: TUserReq, @Param() { id }: IdParam, @Body() body: InvoiceUpsertBody) {
		return await this.apiArrivalService.createInvoiceDraftAfterRefund(userReq.oid, id, body)
	}

	@Put('invoice/update-draft/:id')
	async updateInvoiceDraft(@UserReq() userReq: TUserReq, @Param() { id }: IdParam, @Body() body: InvoiceUpsertBody) {
		return await this.apiArrivalService.updateInvoiceDraft(userReq.oid, id, body)
	}

	@Patch('invoice/payment-draft/:id')
	async paymentInvoiceDraft(@UserReq() userReq: TUserReq, @Param() { id }: IdParam) {
		return await this.apiArrivalService.paymentInvoiceDraft(userReq.oid, id)
	}

	@Patch('invoice/refund/:id')
	async refund(@UserReq() userReq: TUserReq, @Param() { id }: IdParam) {
		return await this.apiArrivalService.refundInvoice(userReq.oid, id)
	}
}
