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
  TicketClinicCreateBody,
  TicketClinicUpdateConsumableBody,
  TicketClinicUpdateItemsMoneyBody,
  TicketClinicUpdatePrescriptionBody,
  TicketClinicUpdateTicketLaboratoryListBody,
  TicketClinicUpdateTicketProcedureListBody,
  TicketClinicUpdateTicketRadiologyListBody,
} from './request'
import { TicketClinicPaymentBody } from './request/ticket-clinic-payment.body'
import { TicketClinicReturnProductListBody } from './request/ticket-clinic-return-product-list.body'
import { TicketClinicUpdateDiagnosisBody } from './request/ticket-clinic-update-diagnosis.body'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicController {
  constructor(private readonly apiTicketClinicService: ApiTicketClinicService) { }

  @Post('create')
  @HasPermission(PermissionId.TICKET_CLINIC_CREATE)
  async create(
    @External() { oid }: TExternal,
    @Body() body: TicketClinicCreateBody
  ) {
    return await this.apiTicketClinicService.create({
      oid,
      body,
    })
  }

  @Post(':id/start-checkup')
  @HasPermission(PermissionId.TICKET_CLINIC_START_CHECKUP)
  async startCheckup(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.startCheckup({ oid, ticketId: id })
  }

  @Post(':id/update-diagnosis')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_DIAGNOSIS_BASIC)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async updateDiagnosisBasic(
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

  @Post(':id/update-ticket-procedure-list')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PROCEDURE_LIST)
  async updateTicketProcedureList(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateTicketProcedureListBody
  ) {
    return await this.apiTicketClinicService.updateTicketProcedureList({
      oid,
      ticketId: id,
      body,
    })
  }

  @Post(':id/update-ticket-product-consumable')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_CONSUMABLE)
  async updateTicketProductConsumable(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateConsumableBody
  ) {
    return await this.apiTicketClinicService.updateTicketProductConsumable({
      oid,
      ticketId: id,
      body,
    })
  }

  @Post(':id/update-ticket-product-prescription')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_PRESCRIPTION)
  async updateTicketProductPrescription(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdatePrescriptionBody
  ) {
    return await this.apiTicketClinicService.updateTicketProductPrescription({
      oid,
      ticketId: id,
      body,
    })
  }

  @Post(':id/update-ticket-radiology-list')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY_LIST)
  async updateTicketRadiologyList(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateTicketRadiologyListBody
  ) {
    return await this.apiTicketClinicService.updateTicketRadiologyList({
      oid,
      ticketId: id,
      body,
    })
  }

  @Post(':id/update-ticket-laboratory-list')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY_LIST)
  async updateTicketLaboratoryList(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateTicketLaboratoryListBody
  ) {
    return await this.apiTicketClinicService.updateTicketLaboratoryList({
      oid,
      ticketId: id,
      body,
    })
  }

  @Post(':id/update-items-money')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_ITEMS_MONEY)
  async updateItemsMoney(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateItemsMoneyBody
  ) {
    return await this.apiTicketClinicService.updateItemsMoney({ oid, ticketId: id, body })
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
  @HasPermission(PermissionId.TICKET_CLINIC_REOPEN)
  async reopen(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.reopen({ oid, ticketId: id })
  }

  @Delete(':id/destroy')
  @HasPermission(PermissionId.TICKET_CLINIC_DESTROY_DRAFT_SCHEDULE)
  async destroy(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.destroy({
      oid,
      ticketId: id,
    })
  }
}
