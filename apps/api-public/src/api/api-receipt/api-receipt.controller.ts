import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { Body, Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiReceiptService } from './api-receipt.service'
import {
  ReceiptGetManyQuery,
  ReceiptGetOneQuery,
  ReceiptPaginationQuery,
  ReceiptPaymentMoneyBody,
  ReceiptUpdateDepositedBody,
  ReceiptUpsertDraftBody,
} from './request'

@ApiTags('Receipt')
@ApiBearerAuth('access-token')
@Controller('receipt')
export class ApiReceiptController {
  constructor(private readonly apiReceiptService: ApiReceiptService) { }

  @Get('pagination')
  @HasPermission(PermissionId.RECEIPT_READ)
  async pagination(@External() { oid }: TExternal, @Query() query: ReceiptPaginationQuery) {
    return await this.apiReceiptService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.RECEIPT_READ)
  async list(@External() { oid }: TExternal, @Query() query: ReceiptGetManyQuery) {
    return await this.apiReceiptService.getMany(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.RECEIPT_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: ReceiptGetOneQuery
  ) {
    return await this.apiReceiptService.getOne(oid, id, query)
  }

  @Post('create-draft')
  @HasPermission(PermissionId.RECEIPT_DRAFT_UPSERT)
  async createDraft(@External() { oid }: TExternal, @Body() body: ReceiptUpsertDraftBody) {
    return await this.apiReceiptService.createDraft({ oid, body })
  }

  @Patch('update-draft/:id')
  @HasPermission(PermissionId.RECEIPT_DRAFT_UPSERT)
  async updateDraft(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptUpsertDraftBody
  ) {
    return await this.apiReceiptService.updateDraft({
      oid,
      receiptId: id,
      body,
    })
  }

  @Post('prepayment/:id')
  @HasPermission(PermissionId.RECEIPT_PAYMENT)
  async prepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptPaymentMoneyBody
  ) {
    return await this.apiReceiptService.prepayment({
      oid,
      receiptId: id,
      body,
    })
  }

  @Patch('update-deposited/:id')
  @HasPermission(PermissionId.RECEIPT_DEPOSITED_UPDATE)
  async updateDeposited(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptUpdateDepositedBody
  ) {
    return await this.apiReceiptService.updateDeposited({
      oid,
      receiptId: id,
      body,
    })
  }

  @Post('refund-prepayment/:id')
  @HasPermission(PermissionId.RECEIPT_REFUND_PAYMENT)
  async refundPrepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptPaymentMoneyBody
  ) {
    return await this.apiReceiptService.refundPrepayment({
      oid,
      receiptId: id,
      body,
    })
  }

  @Post('pay-debt/:id')
  @HasPermission(PermissionId.RECEIPT_PAY_DEBT)
  async payDebt(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptPaymentMoneyBody
  ) {
    return await this.apiReceiptService.payDebt({
      oid,
      receiptId: id,
      body,
    })
  }

  @Post('send-product-and-payment/:id')
  @HasPermission(PermissionId.RECEIPT_SEND_PRODUCT, PermissionId.RECEIPT_PAYMENT)
  async sendProductAndPayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptPaymentMoneyBody
  ) {
    return await this.apiReceiptService.sendProductAndPayment({
      oid,
      receiptId: id,
      body,
    })
  }

  @Post('cancel/:id')
  @HasPermission(PermissionId.RECEIPT_CANCEL)
  async cancel(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiReceiptService.cancel({
      oid,
      receiptId: id,
    })
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.RECEIPT_DRAFT_UPSERT)
  async destroyDraft(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiReceiptService.destroy({
      oid,
      receiptId: id,
    })
  }
}
