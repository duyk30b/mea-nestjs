import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { Body, Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
import { ApiReceiptService } from './api-receipt.service'
import {
  ReceiptDraftInsertBody,
  ReceiptGetManyQuery,
  ReceiptGetOneQuery,
  ReceiptPaginationQuery,
  ReceiptPayDebtBody,
  ReceiptPrepaymentBody,
  ReceiptRefundPrepaymentBody,
  ReceiptReturnProductBody,
  ReceiptSendProductAndPaymentBody,
  ReceiptUpdateBody,
} from './request'

@ApiTags('Receipt')
@ApiBearerAuth('access-token')
@Controller('receipt')
export class ApiReceiptController {
  constructor(private readonly apiReceiptService: ApiReceiptService) {}

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
  @HasPermission(PermissionId.RECEIPT_CREATE_DRAFT)
  async createDraft(@External() { oid }: TExternal, @Body() body: ReceiptDraftInsertBody) {
    return await this.apiReceiptService.createDraft({ oid, body })
  }

  @Delete('destroy-draft/:id')
  @HasPermission(PermissionId.RECEIPT_DELETE)
  async destroyDraft(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiReceiptService.destroyDraft({
      oid,
      receiptId: id,
    })
  }

  @Post('prepayment/:id')
  @HasPermission(PermissionId.RECEIPT_PREPAYMENT)
  async prepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptPrepaymentBody
  ) {
    return await this.apiReceiptService.prepayment({
      oid,
      receiptId: id,
      money: body.money,
    })
  }

  @Post('refund-prepayment/:id')
  @HasPermission(PermissionId.RECEIPT_REFUND_PREPAYMENT)
  async refundPrepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptRefundPrepaymentBody
  ) {
    return await this.apiReceiptService.refundPrepayment({
      oid,
      receiptId: id,
      money: body.money,
    })
  }

  @Post('send-product-and-payment/:id')
  @HasPermission(PermissionId.RECEIPT_SEND_PRODUCT)
  async sendProductAndPayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptSendProductAndPaymentBody
  ) {
    return await this.apiReceiptService.sendProductAndPayment({
      oid,
      receiptId: id,
      time: Date.now(),
      money: body.money,
    })
  }

  @Post('pay-debt/:id')
  @HasPermission(PermissionId.RECEIPT_PAY_DEBT)
  async payDebt(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptPayDebtBody
  ) {
    return await this.apiReceiptService.payDebt({
      oid,
      receiptId: id,
      money: body.money,
      time: Date.now(),
    })
  }

  @Post('return-product/:id')
  @HasPermission(PermissionId.RECEIPT_RETURN_PRODUCT)
  async returnProduct(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptReturnProductBody
  ) {
    return await this.apiReceiptService.returnProduct({
      oid,
      receiptId: id,
      time: Date.now(),
      money: body.money,
    })
  }

  @Delete('soft-delete-refund/:id')
  @HasPermission(PermissionId.RECEIPT_DELETE)
  async softDeleteRefund(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiReceiptService.softDeleteRefund({ oid, receiptId: id })
  }

  @Post('create-quick-receipt')
  @HasPermission(PermissionId.RECEIPT)
  async createQuickReceipt(@External() { oid }: TExternal, @Body() body: ReceiptDraftInsertBody) {
    return await this.apiReceiptService.createQuickReceipt({ oid, body })
  }

  @Patch('update-receipt-draft-and-receipt-prepayment/:id')
  @HasPermission(PermissionId.RECEIPT_UPDATE_RECEIPT_DRAFT_AND_RECEIPT_PREPAYMENT)
  async updateReceiptDraftAndReceiptPrepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptUpdateBody
  ) {
    return await this.apiReceiptService.updateReceiptDraftAndReceiptPrepayment({
      oid,
      receiptId: id,
      body,
    })
  }

  @Patch('update-receipt-debt-and-receipt-success/:id')
  @HasPermission(PermissionId.RECEIPT)
  async updateBasic(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptDraftInsertBody
  ) {
    return await this.apiReceiptService.updateReceiptDebtAndReceiptSuccess({
      oid,
      body,
      receiptId: id,
      time: Date.now(),
    })
  }
}
