import { Body, Controller, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiVisitActionService } from './api-visit-action.service'
import {
  VisitPaymentBody,
  VisitReplacePrescriptionBody,
  VisitReplaceVisitProcedureListBody,
  VisitReplaceVisitRadiologyListBody,
  VisitReturnProductListBody,
  VisitSendProductListBody,
  VisitUpdateVisitItemsMoneyBody,
} from './request'

@ApiTags('Visit')
@ApiBearerAuth('access-token')
@Controller('visit')
export class ApiVisitController {
  constructor(private readonly apiVisitActionService: ApiVisitActionService) {}

  @Put('replace-visit-procedure-list')
  @HasPermission(PermissionId.VISIT_REPLACE_VISIT_PROCEDURE_LIST)
  async replaceVisitProcedureList(
    @External() { oid }: TExternal,
    @Body() body: VisitReplaceVisitProcedureListBody
  ) {
    return await this.apiVisitActionService.replaceVisitProcedureList(oid, body)
  }

  @Put('replace-visit-prescription')
  @HasPermission(PermissionId.VISIT_PRESCRIPTION)
  async replaceVisitPrescription(
    @External() { oid }: TExternal,
    @Body() body: VisitReplacePrescriptionBody
  ) {
    return await this.apiVisitActionService.replaceVisitPrescription(oid, body)
  }

  @Put('replace-visit-radiology-list')
  @HasPermission(PermissionId.VISIT_REPLACE_VISIT_RADIOLOGY_LIST)
  async replaceVisitRadiologyList(
    @External() { oid }: TExternal,
    @Body() body: VisitReplaceVisitRadiologyListBody
  ) {
    return await this.apiVisitActionService.replaceVisitRadiologyList(oid, body)
  }

  @Post('update-visit-items-money')
  @HasPermission(PermissionId.VISIT_UPDATE_ITEMS_MONEY)
  async updateVisitItemsMoney(
    @External() { oid }: TExternal,
    @Body() body: VisitUpdateVisitItemsMoneyBody
  ) {
    return await this.apiVisitActionService.updateVisitItemsMoney(oid, body)
  }

  @Post('send-product-list')
  @HasPermission(PermissionId.VISIT_SEND_PRODUCT)
  async sendProductList(@External() { oid }: TExternal, @Body() body: VisitSendProductListBody) {
    return await this.apiVisitActionService.sendProductList(oid, body)
  }

  @Post('return-product-list')
  @HasPermission(PermissionId.VISIT_RETURN_PRODUCT)
  async returnProductList(
    @External() { oid }: TExternal,
    @Body() body: VisitReturnProductListBody
  ) {
    return await this.apiVisitActionService.returnProductList(oid, body)
  }

  @Post('prepayment')
  @HasPermission(PermissionId.VISIT_PREPAYMENT)
  async prepayment(@External() { oid }: TExternal, @Body() body: VisitPaymentBody) {
    return await this.apiVisitActionService.prepayment(oid, body)
  }

  @Post('refund-overpaid')
  @HasPermission(PermissionId.VISIT_REFUND_OVERPAID)
  async refundOverpaid(@External() { oid }: TExternal, @Body() body: VisitPaymentBody) {
    return await this.apiVisitActionService.refundOverpaid(oid, body)
  }

  @Post('close/:id')
  @HasPermission(PermissionId.VISIT_CLOSE)
  async close(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiVisitActionService.close(oid, id)
  }

  @Post('pay-debt')
  @HasPermission(PermissionId.VISIT_PAY_DEBT)
  async payDebt(@External() { oid }: TExternal, @Body() body: VisitPaymentBody) {
    return await this.apiVisitActionService.payDebt(oid, body)
  }

  @Post('reopen/:id')
  @HasPermission(PermissionId.VISIT_REOPEN)
  async reopen(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiVisitActionService.reopen(oid, id)
  }
}
