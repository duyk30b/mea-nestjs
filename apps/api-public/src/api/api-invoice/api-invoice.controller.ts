import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
import { ApiInvoiceService } from './api-invoice.service'
import {
  InvoiceDraftInsertBody,
  InvoiceGetManyQuery,
  InvoiceGetOneQuery,
  InvoicePaginationQuery,
  InvoicePayDebtBody,
  InvoicePrepaymentBody,
  InvoiceRefundPrepaymentBody,
  InvoiceReturnProductBody,
  InvoiceSendProductAndPaymentBody,
  InvoiceSumDebtQuery,
  InvoiceUpdateBody,
} from './request'

@ApiTags('Invoice')
@ApiBearerAuth('access-token')
@Controller('invoice')
export class ApiInvoiceController {
  constructor(private readonly apiInvoiceService: ApiInvoiceService) {}

  @Get('pagination')
  @HasPermission(PermissionId.INVOICE_READ)
  async pagination(@External() { oid }: TExternal, @Query() query: InvoicePaginationQuery) {
    return await this.apiInvoiceService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.INVOICE_READ)
  async list(@External() { oid }: TExternal, @Query() query: InvoiceGetManyQuery) {
    return await this.apiInvoiceService.getMany(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.INVOICE_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: InvoiceGetOneQuery
  ) {
    return await this.apiInvoiceService.getOne(oid, id, query)
  }

  @Post('create-draft')
  @HasPermission(PermissionId.INVOICE_CREATE_DRAFT)
  async createDraft(@External() { oid }: TExternal, @Body() body: InvoiceDraftInsertBody) {
    return await this.apiInvoiceService.createDraft({ oid, body })
  }

  @Delete('destroy-draft/:id')
  @HasPermission(PermissionId.INVOICE_DELETE)
  async destroyDraft(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiInvoiceService.destroyDraft({
      oid,
      invoiceId: id,
    })
  }

  @Post('prepayment/:id')
  @HasPermission(PermissionId.INVOICE_PREPAYMENT)
  async prepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: InvoicePrepaymentBody
  ) {
    return await this.apiInvoiceService.prepayment({
      oid,
      invoiceId: id,
      money: body.money,
    })
  }

  @Post('refund-prepayment/:id')
  @HasPermission(PermissionId.INVOICE_REFUND_PREPAYMENT)
  async refundPrepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: InvoiceRefundPrepaymentBody
  ) {
    return await this.apiInvoiceService.refundPrepayment({
      oid,
      invoiceId: id,
      money: body.money,
    })
  }

  @Post('send-product-and-payment/:id')
  @HasPermission(PermissionId.INVOICE_SEND_PRODUCT)
  async sendProductAndPayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: InvoiceSendProductAndPaymentBody
  ) {
    return await this.apiInvoiceService.sendProductAndPayment({
      oid,
      invoiceId: id,
      time: Date.now(),
      money: body.money,
    })
  }

  @Post('pay-debt/:id')
  @HasPermission(PermissionId.INVOICE_PAY_DEBT)
  async payDebt(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: InvoicePayDebtBody
  ) {
    return await this.apiInvoiceService.payDebt({
      oid,
      invoiceId: id,
      money: body.money,
      time: Date.now(),
    })
  }

  @Post('return-product/:id')
  @HasPermission(PermissionId.INVOICE_RETURN_PRODUCT)
  async returnProduct(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: InvoiceReturnProductBody
  ) {
    return await this.apiInvoiceService.returnProduct({
      oid,
      invoiceId: id,
      time: Date.now(),
      money: body.money,
    })
  }

  @Delete('soft-delete-refund/:id')
  @HasPermission(PermissionId.INVOICE_DELETE)
  async softDeleteRefund(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiInvoiceService.softDeleteRefund({
      oid,
      invoiceId: id,
    })
  }

  @Get('sum-invoice-debt')
  @HasPermission(PermissionId.INVOICE_READ)
  async sumInvoiceDebt(@External() { oid }: TExternal, @Query() query: InvoiceSumDebtQuery) {
    return await this.apiInvoiceService.sumInvoiceDebt(oid, query)
  }

  @Post('create-quick-invoice')
  @HasPermission(PermissionId.INVOICE)
  async createQuickInvoice(@External() { oid }: TExternal, @Body() body: InvoiceDraftInsertBody) {
    return await this.apiInvoiceService.createQuickInvoice({ oid, body })
  }

  @Patch('update-invoice-draft-and-invoice-prepayment/:id')
  @HasPermission(PermissionId.INVOICE_UPDATE_INVOICE_DRAFT_AND_INVOICE_PREPAYMENT)
  async updateInvoiceDraftAndInvoicePrepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: InvoiceUpdateBody
  ) {
    return await this.apiInvoiceService.updateInvoiceDraftAndInvoicePrepayment({
      oid,
      invoiceId: id,
      body,
    })
  }

  @Patch('update-invoice-debt-and-invoice-success/:id')
  @HasPermission(PermissionId.INVOICE)
  async updateBasic(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: InvoiceDraftInsertBody
  ) {
    return await this.apiInvoiceService.updateInvoiceDebtAndInvoiceSuccess({
      oid,
      body,
      invoiceId: id,
      time: Date.now(),
    })
  }
}
