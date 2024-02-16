import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
import { ApiInvoiceService } from './api-invoice.service'
import {
  InvoiceDraftCreateBody,
  InvoiceDraftUpdateBody,
  InvoiceGetManyQuery,
  InvoiceGetOneQuery,
  InvoicePaginationQuery,
  InvoicePaymentBody,
  InvoiceSumDebtQuery,
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

  @Post('create-basic')
  @HasPermission(PermissionId.INVOICE)
  async createBasic(@External() { oid }: TExternal, @Body() body: InvoiceDraftCreateBody) {
    return await this.apiInvoiceService.createBasic({ oid, body })
  }

  @Patch('update-basic/:id')
  @HasPermission(PermissionId.INVOICE)
  async updateBasic(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: InvoiceDraftCreateBody
  ) {
    return await this.apiInvoiceService.updateBasic({
      oid,
      body,
      oldInvoiceId: id,
      time: Date.now(),
    })
  }

  @Post('create-draft')
  @HasPermission(PermissionId.INVOICE_CREATE_DRAFT)
  async createDraft(@External() { oid }: TExternal, @Body() body: InvoiceDraftCreateBody) {
    return await this.apiInvoiceService.createDraft({ oid, body })
  }

  @Patch('update-draft/:id')
  @HasPermission(PermissionId.INVOICE_UPDATE_DRAFT)
  async updateDraft(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: InvoiceDraftUpdateBody
  ) {
    return await this.apiInvoiceService.updateDraft({
      oid,
      invoiceId: id,
      body,
    })
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
    @Body() body: InvoicePaymentBody
  ) {
    return await this.apiInvoiceService.prepayment({
      oid,
      invoiceId: id,
      money: body.money,
    })
  }

  @Post('start-ship-and-payment/:id')
  @HasPermission(PermissionId.INVOICE_SHIP)
  async startShipAndPayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: InvoicePaymentBody
  ) {
    return await this.apiInvoiceService.startShipAndPayment({
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
    @Body() body: InvoicePaymentBody
  ) {
    return await this.apiInvoiceService.payDebt({
      oid,
      invoiceId: id,
      money: body.money,
      time: Date.now(),
    })
  }

  @Post('start-refund/:id')
  @HasPermission(PermissionId.INVOICE_REFUND)
  async startRefund(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiInvoiceService.startRefund({
      oid,
      invoiceId: id,
      time: Date.now(),
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
}
