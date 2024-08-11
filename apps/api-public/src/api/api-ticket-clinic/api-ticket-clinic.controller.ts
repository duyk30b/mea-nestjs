import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { FastifyFilesInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiTicketClinicService } from './api-ticket-clinic.service'
import {
  TicketClinicChangeConsumableBody,
  TicketClinicChangeItemsMoneyBody,
  TicketClinicChangePrescriptionBody,
  TicketClinicChangeTicketProcedureListBody,
  TicketClinicChangeTicketRadiologyListBody,
  TicketClinicCreateTicketRadiologyBody,
  TicketClinicRegisterWithExistCustomerBody,
  TicketClinicRegisterWithNewCustomerBody,
  TicketClinicUpdateDiagnosisBody,
  TicketClinicUpdateTicketRadiologyBody,
} from './request'
import { TicketClinicPaymentBody } from './request/ticket-clinic-payment.body'
import { TicketClinicReturnProductListBody } from './request/ticket-clinic-return-product-list.body'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicController {
  constructor(private readonly apiTicketClinicService: ApiTicketClinicService) { }

  @Post('register-with-new-customer')
  @HasPermission(PermissionId.TICKET_CLINIC_REGISTER_NEW)
  async registerWithNewUser(
    @External() { oid, uid }: TExternal,
    @Body() body: TicketClinicRegisterWithNewCustomerBody
  ) {
    return await this.apiTicketClinicService.registerWithNewUser({
      oid,
      body,
      userId: uid,
    })
  }

  @Post('register-with-exist-customer')
  @HasPermission(PermissionId.TICKET_CLINIC_REGISTER_NEW)
  async registerWithExistUser(
    @External() { oid, uid }: TExternal,
    @Body() body: TicketClinicRegisterWithExistCustomerBody
  ) {
    return await this.apiTicketClinicService.registerWithExistUser({
      oid,
      userId: uid,
      body,
    })
  }

  @Post(':id/start-checkup')
  @HasPermission(PermissionId.TICKET_CLINIC_START_CHECKUP)
  async startCheckup(@External() { oid, user, uid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.startCheckup({ oid, userId: uid, user, ticketId: id })
  }

  @Post(':id/update-diagnosis')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_DIAGNOSIS)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async update(
    @External() { oid }: TExternal,
    @UploadedFiles() files: FileUploadDto[],
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateDiagnosisBody
  ) {
    return await this.apiTicketClinicService.updateDiagnosis({
      oid,
      ticketId: id,
      body,
      files,
    })
  }

  @Post(':id/change-ticket-procedure-list')
  @HasPermission(PermissionId.TICKET_CLINIC_CHANGE_TICKET_PROCEDURE_LIST)
  async changeTicketProcedureList(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicChangeTicketProcedureListBody
  ) {
    return await this.apiTicketClinicService.changeTicketProcedureList({
      oid,
      ticketId: id,
      body,
    })
  }

  @Post(':id/change-ticket-radiology-list')
  @HasPermission(PermissionId.TICKET_CLINIC_CHANGE_TICKET_RADIOLOGY_LIST)
  async changeTicketRadiologyList(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicChangeTicketRadiologyListBody
  ) {
    return await this.apiTicketClinicService.changeTicketRadiologyList({
      oid,
      ticketId: id,
      body,
    })
  }

  @Post(':id/create-ticket-radiology')
  @HasPermission(PermissionId.TICKET_CLINIC_UPSERT_TICKET_RADIOLOGY_RESULT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async createTicketRadiology(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @UploadedFiles() files: FileUploadDto[],
    @Body() body: TicketClinicCreateTicketRadiologyBody
  ) {
    return await this.apiTicketClinicService.createTicketRadiology({
      oid,
      ticketId: id,
      body,
      files,
    })
  }

  @Post(':id/update-ticket-radiology')
  @HasPermission(PermissionId.TICKET_CLINIC_UPSERT_TICKET_RADIOLOGY_RESULT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async updateTicketRadiology(
    @External() { oid }: TExternal,
    @UploadedFiles() files: FileUploadDto[],
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateTicketRadiologyBody
  ) {
    return await this.apiTicketClinicService.updateTicketRadiology({
      oid,
      ticketId: id,
      body,
      files,
    })
  }

  @Post(':id/change-consumable')
  @HasPermission(PermissionId.TICKET_CLINIC_CHANGE_CONSUMABLE)
  async changeConsumable(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicChangeConsumableBody
  ) {
    return await this.apiTicketClinicService.changeConsumable({
      oid,
      ticketId: id,
      body,
    })
  }

  @Post(':id/change-prescription')
  @HasPermission(PermissionId.TICKET_CLINIC_CHANGE_PRESCRIPTION)
  async changePrescription(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicChangePrescriptionBody
  ) {
    return await this.apiTicketClinicService.changePrescription({
      oid,
      ticketId: id,
      body,
    })
  }

  @Post(':id/change-items-money')
  @HasPermission(PermissionId.TICKET_CLINIC_CHANGE_ITEMS_MONEY)
  async changeItemsMoney(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicChangeItemsMoneyBody
  ) {
    return await this.apiTicketClinicService.changeItemsMoney({ oid, ticketId: id, body })
  }

  @Post(':id/send-product')
  @HasPermission(PermissionId.TICKET_CLINIC_SEND_PRODUCT)
  async sendProduct(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.sendProduct({ oid, ticketId: id })
  }

  @Post(':id/return-product')
  @HasPermission(PermissionId.TICKET_CLINIC_RETURN_PRODUCT)
  async returnProduct(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicReturnProductListBody
  ) {
    return await this.apiTicketClinicService.returnProduct({ oid, ticketId: id, body })
  }

  @Post(':id/prepayment')
  @HasPermission(PermissionId.TICKET_CLINIC_PREPAYMENT)
  async prepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicPaymentBody
  ) {
    return await this.apiTicketClinicService.prepayment({ oid, ticketId: id, body })
  }

  @Post(':id/refund-overpaid')
  @HasPermission(PermissionId.TICKET_CLINIC_REFUND_OVERPAID)
  async refundOverpaid(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicPaymentBody
  ) {
    return await this.apiTicketClinicService.refundOverpaid({ oid, ticketId: id, body })
  }

  @Post(':id/pay-debt')
  @HasPermission(PermissionId.TICKET_CLINIC_PAY_DEBT)
  async payDebt(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicPaymentBody
  ) {
    return await this.apiTicketClinicService.payDebt({ oid, ticketId: id, body })
  }

  @Post(':id/close')
  @HasPermission(PermissionId.TICKET_CLINIC_CLOSE)
  async close(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.close({ oid, ticketId: id })
  }

  @Post(':id/reopen')
  @HasPermission(PermissionId.TICKET_CLINIC_READ)
  async reopen(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.reopen({ oid, ticketId: id })
  }

  @Delete(':id/destroy-draft-schedule')
  @HasPermission(PermissionId.TICKET_CLINIC_DESTROY_DRAFT_SCHEDULE)
  async destroyDraftSchedule(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.destroyDraftSchedule({ oid, ticketId: id })
  }
}
