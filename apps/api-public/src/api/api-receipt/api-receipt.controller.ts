import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { Body, Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
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
  @HasPermission(PermissionId.RECEIPT_CREATE_DRAFT)
  async createDraft(@External() { oid }: TExternal, @Body() body: ReceiptDraftInsertBody) {
    return await this.apiReceiptService.createDraft({ oid, body })
  }

  @Patch('update-draft-prepayment/:id')
  @HasPermission(PermissionId.RECEIPT_UPDATE_DRAFT_PREPAYMENT)
  async updateDraftPrepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptUpdateBody
  ) {
    return await this.apiReceiptService.updateDraftPrepayment({
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
    @Body() body: ReceiptPrepaymentBody
  ) {
    return await this.apiReceiptService.prepayment({
      oid,
      receiptId: id,
      money: body.money,
    })
  }

  @Post('refund-prepayment/:id')
  @HasPermission(PermissionId.RECEIPT_REFUND_PAYMENT)
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

  @Post('send-product-and-payment/:id')
  @HasPermission(PermissionId.RECEIPT_SEND_PRODUCT, PermissionId.RECEIPT_PAYMENT)
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

  @Post('cancel/:id')
  @HasPermission(PermissionId.RECEIPT_CANCEL)
  async cancel(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptReturnProductBody
  ) {
    return await this.apiReceiptService.cancel({
      oid,
      receiptId: id,
      time: Date.now(),
      money: body.money,
    })
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.RECEIPT_DESTROY_DRAFT)
  async destroyDraft(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiReceiptService.destroy({
      oid,
      receiptId: id,
    })
  }
}
