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
import { ApiTicketEyeService } from './api-ticket-eye.service'
import {
  TicketEyeChangeConsumableBody,
  TicketEyeChangeItemsMoneyBody,
  TicketEyeChangePrescriptionBody,
  TicketEyeChangeTicketProcedureListBody,
  TicketEyeChangeTicketRadiologyListBody,
  TicketEyeRegisterWithExistCustomerBody,
  TicketEyeRegisterWithNewCustomerBody,
  TicketEyeUpdateDiagnosisBody,
} from './request'
import { TicketEyeReturnProductListBody } from './request/ticket-eye-return-product-list.body'
import { TicketEyePaymentBody } from './request/ticket-eye-update.body'

@ApiTags('TicketEye')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketEyeController {
  constructor(private readonly apiTicketEyeService: ApiTicketEyeService) { }

  // @Post('register-with-new-customer')
  // @HasPermission(PermissionId.TICKET_CLINIC_REGISTER_NEW)
  // async registerWithNewUser(
  //   @External() { oid, uid }: TExternal,
  //   @Body() body: TicketEyeRegisterWithNewCustomerBody
  // ) {
  //   return await this.apiTicketEyeService.registerWithNewUser({
  //     oid,
  //     body,
  //     userId: uid,
  //   })
  // }

  // @Post('register-with-exist-customer')
  // @HasPermission(PermissionId.TICKET_CLINIC_REGISTER_NEW)
  // async registerWithExistUser(
  //   @External() { oid, uid }: TExternal,
  //   @Body() body: TicketEyeRegisterWithExistCustomerBody
  // ) {
  //   return await this.apiTicketEyeService.registerWithExistUser({
  //     oid,
  //     userId: uid,
  //     body,
  //   })
  // }

  // @Post(':id/start-checkup')
  // @HasPermission(PermissionId.TICKET_CLINIC_START_CHECKUP)
  // async startCheckup(@External() { oid, user, uid }: TExternal, @Param() { id }: IdParam) {
  //   return await this.apiTicketEyeService.startCheckup({ oid, userId: uid, user, ticketId: id })
  // }

  // @Post(':id/update-diagnosis')
  // @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_DIAGNOSIS)
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  // async update(
  //   @External() { oid }: TExternal,
  //   @UploadedFiles() files: FileUploadDto[],
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketEyeUpdateDiagnosisBody
  // ) {
  //   return await this.apiTicketEyeService.updateDiagnosis({
  //     oid,
  //     ticketId: id,
  //     body,
  //     files,
  //   })
  // }

  // @Post(':id/change-ticket-procedure-list')
  // @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PROCEDURE_LIST)
  // async changeTicketProcedureList(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketEyeChangeTicketProcedureListBody
  // ) {
  //   return await this.apiTicketEyeService.changeTicketProcedureList({
  //     oid,
  //     ticketId: id,
  //     body,
  //   })
  // }

  // @Post(':id/change-ticket-radiology-list')
  // @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY_LIST)
  // async changeTicketRadiologyList(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketEyeChangeTicketRadiologyListBody
  // ) {
  //   return await this.apiTicketEyeService.changeTicketRadiologyList({
  //     oid,
  //     ticketId: id,
  //     body,
  //   })
  // }

  // @Post(':id/change-consumable')
  // @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_CONSUMABLE)
  // async changeConsumable(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketEyeChangeConsumableBody
  // ) {
  //   return await this.apiTicketEyeService.changeConsumable({
  //     oid,
  //     ticketId: id,
  //     body,
  //   })
  // }

  // @Post(':id/change-prescription')
  // @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_PRESCRIPTION)
  // async changePrescription(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketEyeChangePrescriptionBody
  // ) {
  //   return await this.apiTicketEyeService.changePrescription({
  //     oid,
  //     ticketId: id,
  //     body,
  //   })
  // }

  // @Post(':id/change-items-money')
  // @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_ITEMS_MONEY)
  // async changeItemsMoney(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketEyeChangeItemsMoneyBody
  // ) {
  //   return await this.apiTicketEyeService.changeItemsMoney({ oid, ticketId: id, body })
  // }

  // @Post(':id/send-product')
  // @HasPermission(PermissionId.TICKET_CLINIC_SEND_PRODUCT)
  // async sendProduct(@External() { oid }: TExternal, @Param() { id }: IdParam) {
  //   return await this.apiTicketEyeService.sendProduct({ oid, ticketId: id })
  // }

  // @Post(':id/return-product')
  // @HasPermission(PermissionId.TICKET_CLINIC_RETURN_PRODUCT)
  // async returnProduct(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketEyeReturnProductListBody
  // ) {
  //   return await this.apiTicketEyeService.returnProduct({ oid, ticketId: id, body })
  // }

  // @Post(':id/prepayment')
  // @HasPermission(PermissionId.TICKET_CLINIC_PREPAYMENT)
  // async prepayment(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketEyePaymentBody
  // ) {
  //   return await this.apiTicketEyeService.prepayment({ oid, ticketId: id, body })
  // }

  // @Post(':id/refund-overpaid')
  // @HasPermission(PermissionId.TICKET_CLINIC_REFUND_OVERPAID)
  // async refundOverpaid(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketEyePaymentBody
  // ) {
  //   return await this.apiTicketEyeService.refundOverpaid({ oid, ticketId: id, body })
  // }

  // @Post(':id/pay-debt')
  // @HasPermission(PermissionId.TICKET_CLINIC_PAY_DEBT)
  // async payDebt(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketEyePaymentBody
  // ) {
  //   return await this.apiTicketEyeService.payDebt({ oid, ticketId: id, body })
  // }

  // @Post(':id/close')
  // @HasPermission(PermissionId.TICKET_CLINIC_CLOSE)
  // async close(@External() { oid }: TExternal, @Param() { id }: IdParam) {
  //   return await this.apiTicketEyeService.close({ oid, ticketId: id })
  // }

  // @Post(':id/reopen')
  // @HasPermission(PermissionId.TICKET_CLINIC_READ)
  // async reopen(@External() { oid }: TExternal, @Param() { id }: IdParam) {
  //   return await this.apiTicketEyeService.reopen({ oid, ticketId: id })
  // }

  // @Delete(':id/destroy-draft-schedule')
  // @HasPermission(PermissionId.TICKET_CLINIC_DESTROY_DRAFT_SCHEDULE)
  // async destroyDraftSchedule(@External() { oid }: TExternal, @Param() { id }: IdParam) {
  //   return await this.apiTicketEyeService.destroyDraftSchedule({ oid, ticketId: id })
  // }
}
