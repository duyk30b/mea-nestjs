import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { Body, Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiReceiptAction } from './api-receipt.action'
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
  constructor(
    private readonly apiReceiptService: ApiReceiptService,
    private readonly apiReceiptAction: ApiReceiptAction
  ) { }

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

  @Get('/:id/detail')
  @HasPermission(PermissionId.RECEIPT_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: ReceiptGetOneQuery
  ) {
    return await this.apiReceiptService.getOne(oid, id, query)
  }

  @Post('create-draft')
  @HasPermission(PermissionId.RECEIPT_DRAFT_CRUD)
  async createDraft(@External() { oid }: TExternal, @Body() body: ReceiptUpsertDraftBody) {
    return await this.apiReceiptService.createDraft({ oid, body })
  }

  @Patch('/:id/update-draft')
  @HasPermission(PermissionId.RECEIPT_DRAFT_CRUD)
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

  @Patch('/:id/deposited-update')
  @HasPermission(PermissionId.RECEIPT_DEPOSITED_UPDATE)
  async depositedUpdate(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptUpdateDepositedBody
  ) {
    return await this.apiReceiptService.depositedUpdate({
      oid,
      receiptId: id,
      body,
    })
  }

  // ================== ACTION ================== //

  @Delete('/:id/draft-destroy')
  @HasPermission(PermissionId.RECEIPT_DRAFT_CRUD)
  async draftDestroy(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiReceiptAction.destroy({
      oid,
      receiptId: id,
    })
  }

  @Delete('/:id/deposited-destroy')
  @HasPermission(PermissionId.RECEIPT_DEPOSITED_DESTROY)
  async depositedDestroy(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiReceiptAction.destroy({
      oid,
      receiptId: id,
    })
  }

  @Delete('/:id/cancelled-destroy')
  @HasPermission(PermissionId.RECEIPT_CANCELLED_DESTROY)
  async cancelledDestroy(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiReceiptAction.destroy({
      oid,
      receiptId: id,
    })
  }

  @Post('/:id/send-product-and-payment-and-close')
  @HasPermission(
    PermissionId.RECEIPT_SEND_PRODUCT,
    PermissionId.RECEIPT_PAYMENT,
    PermissionId.RECEIPT_CLOSE
  )
  async sendProductAndPaymentAndClose(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptPaymentMoneyBody
  ) {
    return await this.apiReceiptAction.sendProductAndPaymentAndClose({
      oid,
      userId: uid,
      receiptId: id,
      body,
    })
  }

  @Post('/:id/prepayment')
  @HasPermission(PermissionId.RECEIPT_PAYMENT)
  async prepayment(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptPaymentMoneyBody
  ) {
    return await this.apiReceiptAction.prepayment({
      userId: uid,
      oid,
      receiptId: id,
      body,
    })
  }

  @Post('/:id/send-product')
  @HasPermission(PermissionId.TICKET_ORDER_SEND_PRODUCT)
  async sendProduct(@External() { oid, uid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiReceiptAction.sendProduct({
      oid,
      userId: uid,
      receiptId: id,
    })
  }

  @Post('/:id/close')
  @HasPermission(PermissionId.RECEIPT_CLOSE)
  async close(@External() { oid, uid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiReceiptAction.close({
      oid,
      userId: uid,
      receiptId: id,
    })
  }

  @Post('/:id/refund-overpaid')
  @HasPermission(PermissionId.RECEIPT_REFUND_OVERPAID)
  async refundOverpaid(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptPaymentMoneyBody
  ) {
    return await this.apiReceiptAction.refundOverpaid({
      oid,
      userId: uid,
      receiptId: id,
      body,
    })
  }

  @Post('/:id/pay-debt')
  @HasPermission(PermissionId.RECEIPT_PAYMENT)
  async payDebt(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptPaymentMoneyBody
  ) {
    return await this.apiReceiptAction.payDebt({
      oid,
      userId: uid,
      receiptId: id,
      body,
    })
  }

  @Post('/:id/terminate')
  @HasPermission(PermissionId.RECEIPT_TERMINATE)
  async terminate(@External() { oid, uid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiReceiptAction.terminate({
      oid,
      userId: uid,
      receiptId: id,
    })
  }
}
