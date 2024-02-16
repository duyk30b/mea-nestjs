import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { Body, Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
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

  @Post('create-basic')
  @HasPermission(PermissionId.RECEIPT)
  async createBasic(@External() { oid }: TExternal, @Body() body: ReceiptDraftCreateBody) {
    return await this.apiReceiptService.createBasic({ oid, body })
  }

  @Patch('update-basic/:id')
  @HasPermission(PermissionId.RECEIPT)
  async updateBasic(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptDraftCreateBody
  ) {
    return await this.apiReceiptService.updateBasic({
      oid,
      body,
      oldReceiptId: id,
      time: Date.now(),
    })
  }

  @Post('create-draft')
  @HasPermission(PermissionId.RECEIPT_CREATE_DRAFT)
  async createDraft(@External() { oid }: TExternal, @Body() body: ReceiptDraftCreateBody) {
    return await this.apiReceiptService.createDraft({ oid, body })
  }

  @Patch('update-draft/:id')
  @HasPermission(PermissionId.RECEIPT_UPDATE_DRAFT)
  async updateDraft(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptDraftUpdateBody
  ) {
    return await this.apiReceiptService.updateDraft({ oid, receiptId: id, body })
  }

  @Delete('destroy-draft/:id')
  @HasPermission(PermissionId.RECEIPT_DELETE)
  async destroyDraft(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiReceiptService.destroyDraft({ oid, receiptId: id })
  }

  @Post('prepayment/:id')
  @HasPermission(PermissionId.RECEIPT_PREPAYMENT)
  async prepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptPaymentBody
  ) {
    return await this.apiReceiptService.prepayment({
      oid,
      receiptId: id,
      money: body.money,
    })
  }

  @Post('start-ship-and-payment/:id')
  @HasPermission(PermissionId.RECEIPT_SHIP)
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
  @HasPermission(PermissionId.RECEIPT_PAY_DEBT)
  async payDebt(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ReceiptPaymentBody
  ) {
    return await this.apiReceiptService.payDebt({
      oid,
      receiptId: id,
      money: body.money,
      time: Date.now(),
    })
  }

  @Post('start-refund/:id')
  @HasPermission(PermissionId.RECEIPT_REFUND)
  async startRefund(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiReceiptService.startRefund({
      oid,
      receiptId: id,
      time: Date.now(),
    })
  }

  @Delete('soft-delete-refund/:id')
  @HasPermission(PermissionId.RECEIPT_DELETE)
  async softDeleteRefund(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiReceiptService.softDeleteRefund({ oid, receiptId: id })
  }
}
