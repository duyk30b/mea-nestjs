import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { HasPermission } from '../../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/database/entities/permission.entity'
import { VisitPaymentBody } from '../request'
import { ApiInvoiceVisitService } from './api-invoice-visit.service'
import {
  InvoiceVisitInsertBody,
  InvoiceVisitUpdateBody,
} from './request/invoice-visit-draft-upsert.body'

@ApiTags('InvoiceVisit')
@ApiBearerAuth('access-token')
@Controller('invoice-visit')
export class ApiInvoiceVisitController {
  constructor(private readonly apiInvoiceVisitService: ApiInvoiceVisitService) {}

  @Post('create-draft')
  @HasPermission(PermissionId.INVOICE_DRAFT)
  async createDraft(@External() { oid }: TExternal, @Body() body: InvoiceVisitInsertBody) {
    return await this.apiInvoiceVisitService.createDraft({ oid, body })
  }

  @Patch('update-draft/:id')
  @HasPermission(PermissionId.INVOICE_DRAFT)
  async updateDraft(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: InvoiceVisitUpdateBody
  ) {
    return await this.apiInvoiceVisitService.updateDraft({
      oid,
      visitId: id,
      body,
    })
  }

  @Delete('destroy-draft/:id')
  @HasPermission(PermissionId.INVOICE_DRAFT)
  async destroyDraft(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiInvoiceVisitService.destroyDraft({
      oid,
      visitId: id,
    })
  }

  @Post('prepayment')
  @HasPermission(PermissionId.INVOICE_PREPAYMENT)
  async prepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: VisitPaymentBody
  ) {
    return await this.apiInvoiceVisitService.prepayment({ oid, visitId: id, body })
  }

  @Post('send-product-and-payment/:id')
  @HasPermission(PermissionId.INVOICE_SEND_PRODUCT)
  async sendProductAndPayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: VisitPaymentBody
  ) {
    return await this.apiInvoiceVisitService.sendProductAndPayment({
      oid,
      visitId: id,
      time: Date.now(),
      money: body.money,
    })
  }
}
