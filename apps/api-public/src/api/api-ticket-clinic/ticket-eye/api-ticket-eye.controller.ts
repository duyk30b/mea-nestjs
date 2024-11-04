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
import { IdParam } from '../../../../../_libs/common/dto'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { HasPermission } from '../../../../../_libs/common/guards/permission.guard'
import { FastifyFilesInterceptor } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { VoucherType } from '../../../../../_libs/database/common/variable'
import { PermissionId } from '../../../../../_libs/database/entities/permission.entity'
import { ApiTicketClinicService } from '../api-ticket-clinic.service'
import {
  TicketClinicPaymentBody,
  TicketClinicRegisterBody,
  TicketClinicReturnProductListBody,
  TicketClinicUpdateConsumableBody,
  TicketClinicUpdateDiagnosisBasicBody,
  TicketClinicUpdateDiagnosisSpecialBody,
  TicketClinicUpdateItemsMoneyBody,
  TicketClinicUpdatePrescriptionBody,
  TicketClinicUpdateTicketProcedureListBody,
} from '../request'

@ApiTags('TicketEye')
@ApiBearerAuth('access-token')
@Controller('ticket-eye')
export class ApiTicketEyeController {
  constructor(
    private readonly apiTicketClinicService: ApiTicketClinicService
  ) { }

  @Post('register')
  @HasPermission(PermissionId.TICKET_EYE_REGISTER_NEW)
  async register(
    @External() { oid, uid, clientId }: TExternal,
    @Body() body: TicketClinicRegisterBody
  ) {
    return await this.apiTicketClinicService.register({
      oid,
      body,
    })
  }

  @Delete(':id/destroy-draft-schedule')
  @HasPermission(PermissionId.TICKET_EYE_DESTROY_DRAFT_SCHEDULE)
  async destroyDraftSchedule(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.destroyDraftSchedule({
      oid,
      ticketId: id,
      voucherType: VoucherType.Eye,
    })
  }

  @Post(':id/start-checkup')
  @HasPermission(PermissionId.TICKET_EYE_START_CHECKUP)
  async startCheckup(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.startCheckup({ oid, ticketId: id })
  }

  @Post(':id/update-diagnosis-basic')
  @HasPermission(PermissionId.TICKET_EYE_UPDATE_DIAGNOSIS_BASIC)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async updateDiagnosis(
    @External() { oid }: TExternal,
    @UploadedFiles() files: FileUploadDto[],
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateDiagnosisBasicBody
  ) {
    return await this.apiTicketClinicService.updateDiagnosisBasic({
      oid,
      ticketId: id,
      body,
      files,
    })
  }

  @Post(':id/update-diagnosis-special')
  @HasPermission(PermissionId.TICKET_EYE_UPDATE_DIAGNOSIS_SPECIAL)
  async updateDiagnosisSpecial(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateDiagnosisSpecialBody
  ) {
    return await this.apiTicketClinicService.updateDiagnosisSpecial({
      oid,
      ticketId: id,
      body,
    })
  }

  @Post(':id/update-ticket-procedure-list')
  @HasPermission(PermissionId.TICKET_EYE_UPDATE_TICKET_PROCEDURE_LIST)
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
  @HasPermission(PermissionId.TICKET_EYE_UPDATE_TICKET_PRODUCT_CONSUMABLE)
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
  @HasPermission(PermissionId.TICKET_EYE_UPDATE_TICKET_PRODUCT_PRESCRIPTION)
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

  // @Post(':id/update-ticket-radiology-list')
  // @HasPermission(PermissionId.TICKET_EYE_UPDATE_TICKET_RADIOLOGY_LIST)
  // async updateTicketRadiologyList(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketClinicUpdateTicketRadiologyListBody
  // ) {
  //   return await this.apiTicketClinicService.updateTicketRadiologyList({
  //     oid,
  //     ticketId: id,
  //     body,
  //   })
  // }

  @Post(':id/update-items-money')
  @HasPermission(PermissionId.TICKET_EYE_UPDATE_ITEMS_MONEY)
  async updateItemsMoney(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateItemsMoneyBody
  ) {
    return await this.apiTicketClinicService.updateItemsMoney({ oid, ticketId: id, body })
  }

  @Post(':id/send-product')
  @HasPermission(PermissionId.TICKET_EYE_SEND_PRODUCT)
  async sendProduct(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.sendProduct({ oid, ticketId: id })
  }

  @Post(':id/return-product')
  @HasPermission(PermissionId.TICKET_EYE_RETURN_PRODUCT)
  async returnProduct(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicReturnProductListBody
  ) {
    return await this.apiTicketClinicService.returnProduct({ oid, ticketId: id, body })
  }

  @Post(':id/prepayment')
  @HasPermission(PermissionId.TICKET_EYE_PREPAYMENT)
  async prepayment(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicPaymentBody
  ) {
    return await this.apiTicketClinicService.prepayment({ oid, ticketId: id, body })
  }

  @Post(':id/refund-overpaid')
  @HasPermission(PermissionId.TICKET_EYE_REFUND_OVERPAID)
  async refundOverpaid(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicPaymentBody
  ) {
    return await this.apiTicketClinicService.refundOverpaid({ oid, ticketId: id, body })
  }

  @Post(':id/pay-debt')
  @HasPermission(PermissionId.TICKET_EYE_PAY_DEBT)
  async payDebt(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicPaymentBody
  ) {
    return await this.apiTicketClinicService.payDebt({ oid, ticketId: id, body })
  }

  @Post(':id/close')
  @HasPermission(PermissionId.TICKET_EYE_CLOSE)
  async close(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.close({ oid, ticketId: id })
  }

  @Post(':id/reopen')
  @HasPermission(PermissionId.TICKET_EYE_READ)
  async reopen(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.reopen({ oid, ticketId: id })
  }
}
