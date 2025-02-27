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
  TicketClinicChangeDiscountBody,
  TicketClinicCreateBody,
  TicketClinicUpdateBody,
} from './request'
import { TicketClinicPaymentBody } from './request/ticket-clinic-payment.body'
import { TicketClinicUpdateDiagnosisBody } from './request/ticket-clinic-update-diagnosis.body'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicController {
  constructor(private readonly apiTicketClinicService: ApiTicketClinicService) { }

  @Post('create')
  @HasPermission(PermissionId.TICKET_CLINIC_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: TicketClinicCreateBody) {
    return await this.apiTicketClinicService.create({
      oid,
      body,
    })
  }

  @Post(':id/update')
  @HasPermission(PermissionId.TICKET_CLINIC_CREATE)
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateBody
  ) {
    return await this.apiTicketClinicService.update({
      oid,
      ticketId: id,
      body,
    })
  }

  @Post(':id/start-checkup')
  @HasPermission(PermissionId.TICKET_CLINIC_START_CHECKUP)
  async startCheckup(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.startCheckup({ oid, ticketId: id })
  }

  @Post(':id/update-diagnosis')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_ATTRIBUTE)
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
  @HasPermission(PermissionId.TICKET_CLINIC_CHANGE_DISCOUNT)
  async changeDiscount(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicChangeDiscountBody
  ) {
    return await this.apiTicketClinicService.changeDiscount({ oid, ticketId: id, body })
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
