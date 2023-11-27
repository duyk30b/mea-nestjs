import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { Body, Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../common/request-external'
import { IdParam } from '../../common/swagger'
import { ApiReceiptService } from './api-receipt.service'
import {
    ReceiptDraftCreateBody,
    ReceiptDraftUpdateBody,
    ReceiptGetManyQuery,
    ReceiptGetOneQuery,
    ReceiptPaginationQuery,
    ReceiptPaymentBody,
} from './request'

@ApiTags('Receipt')
@ApiBearerAuth('access-token')
@Controller('receipt')
export class ApiReceiptController {
    constructor(private readonly apiReceiptService: ApiReceiptService) {}

    @Get('pagination')
    async pagination(@External() { oid }: TExternal, @Query() query: ReceiptPaginationQuery) {
        return await this.apiReceiptService.pagination(oid, query)
    }

    @Get('list')
    async list(@External() { oid }: TExternal, @Query() query: ReceiptGetManyQuery) {
        return await this.apiReceiptService.getMany(oid, query)
    }

    @Get('detail/:id')
    async detail(@External() { oid }: TExternal, @Param() { id }: IdParam, @Query() query: ReceiptGetOneQuery) {
        return await this.apiReceiptService.getOne(oid, id, query)
    }

    @Post('create-draft')
    async createDraft(@External() { oid }: TExternal, @Body() body: ReceiptDraftCreateBody) {
        return await this.apiReceiptService.createDraft({ oid, body })
    }

    @Patch('update-draft/:id')
    async updateDraft(@External() { oid }: TExternal, @Param() { id }: IdParam, @Body() body: ReceiptDraftUpdateBody) {
        return await this.apiReceiptService.updateDraft({ oid, receiptId: id, body })
    }

    @Delete('destroy-draft/:id')
    async destroyDraft(@External() { oid }: TExternal, @Param() { id }: IdParam) {
        return await this.apiReceiptService.destroyDraft({ oid, receiptId: id })
    }

    @Post('prepayment/:id')
    async prepayment(@External() { oid }: TExternal, @Param() { id }: IdParam, @Body() body: ReceiptPaymentBody) {
        return await this.apiReceiptService.prepayment({
            oid,
            receiptId: id,
            money: body.money,
        })
    }

    @Post('start-ship-and-payment/:id')
    async startShipAndPayment(
        @External() { oid }: TExternal,
        @Param() { id }: IdParam,
        @Body() body: ReceiptPaymentBody
    ) {
        return await this.apiReceiptService.startShipAndPayment({
            oid,
            receiptId: id,
            time: Date.now(),
            money: body.money,
        })
    }

    @Post('pay-debt/:id')
    async payDebt(@External() { oid }: TExternal, @Param() { id }: IdParam, @Body() body: ReceiptPaymentBody) {
        return await this.apiReceiptService.payDebt({
            oid,
            receiptId: id,
            money: body.money,
            time: Date.now(),
        })
    }

    @Post('start-refund/:id')
    async startRefund(@External() { oid }: TExternal, @Param() { id }: IdParam) {
        return await this.apiReceiptService.startRefund({
            oid,
            receiptId: id,
            time: Date.now(),
        })
    }

    @Delete('soft-delete-refund/:id')
    async softDeleteRefund(@External() { oid }: TExternal, @Param() { id }: IdParam) {
        return await this.apiReceiptService.softDeleteRefund({ oid, receiptId: id })
    }
}
