import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiVisitActionService } from './api-visit-action.service'
import { ApiVisitClinicService } from './api-visit-clinic.service'
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
  VisitReplaceVisitRadiologyListBody,
  VisitReturnProductListBody,
  VisitSendProductListBody,
  VisitUpdateVisitItemsMoneyBody,
} from './request'

@ApiTags('Visit')
@ApiBearerAuth('access-token')
@Controller('visit')
export class ApiVisitController {
  constructor(
    private readonly apiVisitService: ApiVisitService,
    private readonly apiVisitClinicService: ApiVisitClinicService,
    private readonly apiVisitActionService: ApiVisitActionService
  ) {}

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

  @Post('clinic/register-with-new-customer')
  @HasPermission(PermissionId.VISIT_CREATE)
  async registerWithNewUser(
    @External() { oid }: TExternal,
    @Body() body: VisitRegisterWithNewCustomerBody
  ) {
    return await this.apiVisitClinicService.registerWithNewUser(oid, body)
  }

  @Post('clinic/register-with-exist-customer')
  @HasPermission(PermissionId.VISIT_CREATE)
  async registerWithExistUser(
    @External() { oid }: TExternal,
    @Body() body: VisitRegisterWithExistCustomerBody
  ) {
    return await this.apiVisitClinicService.registerWithExistUser(oid, body)
  }

  @Post('clinic/start-checkup/:id')
  @HasPermission(PermissionId.VISIT_START_CHECKUP)
  async startCheckup(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiVisitClinicService.startCheckup(oid, id)
  }

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
