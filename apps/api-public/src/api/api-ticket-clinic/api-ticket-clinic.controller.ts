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
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { FastifyFilesInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { TicketPaymentMoneyBody } from '../api-ticket/request'
import { ApiTicketClinicService } from './api-ticket-clinic.service'
import {
  TicketClinicChangeDiscountBody,
} from './request'
import { TicketClinicUpdateDiagnosisBody } from './request/ticket-clinic-update-diagnosis.body'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicController {
  constructor(private readonly apiTicketClinicService: ApiTicketClinicService) { }

  @Post(':id/start-checkup')
  @UserPermission(PermissionId.TICKET_CLINIC_START_CHECKUP)
  async startCheckup(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.startCheckup({ oid, ticketId: id })
  }

  @Post(':id/update-diagnosis')
  @UserPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_ATTRIBUTE)
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

  @Post(':id/change-discount')
  @UserPermission(PermissionId.TICKET_CLINIC_CHANGE_DISCOUNT)
  async changeDiscount(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicChangeDiscountBody
  ) {
    return await this.apiTicketClinicService.changeDiscount({ oid, ticketId: id, body })
  }

  @Post(':id/prepayment')
  @UserPermission(PermissionId.TICKET_CLINIC_PAYMENT)
  async prepayment(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketPaymentMoneyBody
  ) {
    return await this.apiTicketClinicService.prepayment({ oid, userId: uid, ticketId: id, body })
  }

  @Post(':id/refund-overpaid')
  @UserPermission(PermissionId.TICKET_CLINIC_REFUND_OVERPAID)
  async refundOverpaid(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketPaymentMoneyBody
  ) {
    return await this.apiTicketClinicService.refundOverpaid({
      oid,
      userId: uid,
      ticketId: id,
      body,
    })
  }

  @Post(':id/pay-debt')
  @UserPermission(PermissionId.TICKET_CLINIC_PAYMENT)
  async payDebt(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketPaymentMoneyBody
  ) {
    return await this.apiTicketClinicService.payDebt({ oid, userId: uid, ticketId: id, body })
  }

  @Post(':id/close')
  @UserPermission(PermissionId.TICKET_CLINIC_CLOSE)
  async close(@External() { oid, uid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.close({ oid, userId: uid, ticketId: id })
  }

  @Post(':id/reopen')
  @UserPermission(PermissionId.TICKET_CLINIC_REOPEN)
  async reopen(@External() { oid, uid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.reopen({ oid, userId: uid, ticketId: id })
  }

  @Delete(':id/destroy')
  @UserPermission(PermissionId.TICKET_CLINIC_DESTROY_DRAFT_SCHEDULE)
  async destroy(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.destroy({
      oid,
      ticketId: id,
    })
  }
}
