import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
import { ApiVisitService } from './api-visit.service'
import {
  VisitGetManyQuery,
  VisitGetOneQuery,
  VisitPaginationQuery,
  VisitPaymentBody,
  VisitRegisterWithExistCustomerBody,
  VisitRegisterWithNewCustomerBody,
  VisitReplacePrescriptionBody,
  VisitReplaceVisitProcedureListBody,
  VisitReturnProductListBody,
  VisitSendProductListBody,
  VisitUpdateVisitDiagnosisBody,
  VisitUpdateVisitItemsMoneyBody,
} from './request'

@ApiTags('Visit')
@ApiBearerAuth('access-token')
@Controller('visit')
export class ApiVisitController {
  constructor(private readonly apiVisitService: ApiVisitService) {}

  @Get('pagination')
  @HasPermission(PermissionId.VISIT_READ)
  async pagination(@External() { oid }: TExternal, @Query() query: VisitPaginationQuery) {
    return await this.apiVisitService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.VISIT_READ)
  async list(@External() { oid }: TExternal, @Query() query: VisitGetManyQuery) {
    return await this.apiVisitService.getMany(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.VISIT_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: VisitGetOneQuery
  ) {
    return await this.apiVisitService.getOne(oid, id, query)
  }

  @Post('register-with-new-customer')
  @HasPermission(PermissionId.VISIT_CREATE)
  async registerWithNewUser(
    @External() { oid }: TExternal,
    @Body() body: VisitRegisterWithNewCustomerBody
  ) {
    return await this.apiVisitService.registerWithNewUser(oid, body)
  }

  @Post('register-with-exist-customer')
  @HasPermission(PermissionId.VISIT_CREATE)
  async registerWithExistUser(
    @External() { oid }: TExternal,
    @Body() body: VisitRegisterWithExistCustomerBody
  ) {
    return await this.apiVisitService.registerWithExistUser(oid, body)
  }

  @Post(':id/start-checkup')
  @HasPermission(PermissionId.VISIT_START_CHECKUP)
  async startCheckup(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiVisitService.startCheckup(oid, id)
  }

  @Put('update-visit-diagnosis')
  @HasPermission(PermissionId.VISIT_DIAGNOSIS)
  async updateVisitDiagnosis(
    @External() { oid }: TExternal,
    @Body() body: VisitUpdateVisitDiagnosisBody
  ) {
    return await this.apiVisitService.updateVisitDiagnosis(oid, body)
  }

  @Put('replace-visit-procedure-list')
  @HasPermission(PermissionId.VISIT_PROCEDURES)
  async replaceVisitProcedureList(
    @External() { oid }: TExternal,
    @Body() body: VisitReplaceVisitProcedureListBody
  ) {
    return await this.apiVisitService.replaceVisitProcedureList(oid, body)
  }

  @Put('replace-visit-prescription')
  @HasPermission(PermissionId.VISIT_PRESCRIPTION)
  async replaceVisitPrescription(
    @External() { oid }: TExternal,
    @Body() body: VisitReplacePrescriptionBody
  ) {
    return await this.apiVisitService.replaceVisitPrescription(oid, body)
  }

  @Post('update-visit-items-money')
  @HasPermission(PermissionId.VISIT_UPDATE_ITEMS_MONEY)
  async updateVisitItemsMoney(
    @External() { oid }: TExternal,
    @Body() body: VisitUpdateVisitItemsMoneyBody
  ) {
    return await this.apiVisitService.updateVisitItemsMoney(oid, body)
  }

  @Post('send-product-list')
  @HasPermission(PermissionId.VISIT_SEND_PRODUCT)
  async sendProductList(@External() { oid }: TExternal, @Body() body: VisitSendProductListBody) {
    return await this.apiVisitService.sendProductList(oid, body)
  }

  @Post('return-product-list')
  @HasPermission(PermissionId.VISIT_RETURN_PRODUCT)
  async returnProductList(
    @External() { oid }: TExternal,
    @Body() body: VisitReturnProductListBody
  ) {
    return await this.apiVisitService.returnProductList(oid, body)
  }

  @Post('prepayment')
  @HasPermission(PermissionId.VISIT_PREPAYMENT)
  async prepayment(@External() { oid }: TExternal, @Body() body: VisitPaymentBody) {
    return await this.apiVisitService.prepayment(oid, body)
  }

  @Post('refund-overpaid')
  @HasPermission(PermissionId.VISIT_REFUND_OVERPAID)
  async refundOverpaid(@External() { oid }: TExternal, @Body() body: VisitPaymentBody) {
    return await this.apiVisitService.refundOverpaid(oid, body)
  }

  @Post('close/:id')
  @HasPermission(PermissionId.VISIT_CLOSE)
  async close(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiVisitService.close(oid, id)
  }

  @Post('pay-debt')
  @HasPermission(PermissionId.VISIT_PAY_DEBT)
  async payDebt(@External() { oid }: TExternal, @Body() body: VisitPaymentBody) {
    return await this.apiVisitService.payDebt(oid, body)
  }

  @Post('reopen/:id')
  @HasPermission(PermissionId.VISIT_REOPEN)
  async reopen(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiVisitService.reopen(oid, id)
  }
}
