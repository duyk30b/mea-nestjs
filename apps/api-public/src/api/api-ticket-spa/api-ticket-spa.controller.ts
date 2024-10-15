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
import { ApiTicketSpaService } from './api-ticket-spa.service'
import {
  TicketSpaChangeConsumableBody,
  TicketSpaChangeItemsMoneyBody,
  TicketSpaChangePrescriptionBody,
  TicketSpaChangeTicketProcedureListBody,
  TicketSpaChangeTicketRadiologyListBody,
  TicketSpaCreateTicketRadiologyBody,
  TicketSpaRegister,
  TicketSpaUpdateDiagnosisBody,
  TicketSpaUpdateTicketRadiologyBody,
} from './request'

@ApiTags('TicketSpa')
@ApiBearerAuth('access-token')
@Controller('ticket-spa')
export class ApiTicketSpaController {
  constructor(private readonly apiTicketSpaService: ApiTicketSpaService) { }

  // @Post('register')
  // @HasPermission(PermissionId.TICKET_SPA_REGISTER_NEW)
  // async register(
  //   @External() { oid, uid }: TExternal,
  //   @Body() body: TicketSpaRegister
  // ) {
  //   return await this.apiTicketSpaService.register({
  //     oid,
  //     body,
  //     userIdWelcomer: uid,
  //   })
  // }

  // @Post(':id/start-checkup')
  // @HasPermission(PermissionId.TICKET_SPA_START_CHECKUP)
  // async startCheckup(@External() { oid, user, uid }: TExternal, @Param() { id }: IdParam) {
  //   return await this.apiTicketSpaService.startCheckup({ oid, userId: uid, user, ticketId: id })
  // }

  // @Post(':id/update-diagnosis')
  // @HasPermission(PermissionId.TICKET_SPA_UPDATE_DIAGNOSIS)
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  // async update(
  //   @External() { oid }: TExternal,
  //   @UploadedFiles() files: FileUploadDto[],
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketSpaUpdateDiagnosisBody
  // ) {
  //   return await this.apiTicketSpaService.updateDiagnosis({
  //     oid,
  //     ticketId: id,
  //     body,
  //     files,
  //   })
  // }

  // @Post(':id/change-ticket-procedure-list')
  // @HasPermission(PermissionId.TICKET_SPA_UPDATE_TICKET_PROCEDURE_LIST)
  // async changeTicketProcedureList(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketSpaChangeTicketProcedureListBody
  // ) {
  //   return await this.apiTicketSpaService.changeTicketProcedureList({
  //     oid,
  //     ticketId: id,
  //     body,
  //   })
  // }

  // @Post(':id/change-ticket-radiology-list')
  // @HasPermission(PermissionId.TICKET_SPA_UPDATE_TICKET_RADIOLOGY_LIST)
  // async changeTicketRadiologyList(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketSpaChangeTicketRadiologyListBody
  // ) {
  //   return await this.apiTicketSpaService.changeTicketRadiologyList({
  //     oid,
  //     ticketId: id,
  //     body,
  //   })
  // }

  // @Post(':id/create-ticket-radiology')
  // @HasPermission(PermissionId.TICKET_SPA_UPSERT_TICKET_RADIOLOGY_RESULT)
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  // async createTicketRadiology(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @UploadedFiles() files: FileUploadDto[],
  //   @Body() body: TicketSpaCreateTicketRadiologyBody
  // ) {
  //   return await this.apiTicketSpaService.createTicketRadiology({
  //     oid,
  //     ticketId: id,
  //     body,
  //     files,
  //   })
  // }

  // @Post(':id/update-ticket-radiology')
  // @HasPermission(PermissionId.TICKET_SPA_UPSERT_TICKET_RADIOLOGY_RESULT)
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  // async updateTicketRadiology(
  //   @External() { oid }: TExternal,
  //   @UploadedFiles() files: FileUploadDto[],
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketSpaUpdateTicketRadiologyBody
  // ) {
  //   return await this.apiTicketSpaService.updateTicketRadiology({
  //     oid,
  //     ticketId: id,
  //     body,
  //     files,
  //   })
  // }

  // @Post(':id/change-consumable')
  // @HasPermission(PermissionId.TICKET_SPA_UPDATE_CONSUMABLE)
  // async changeConsumable(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketSpaChangeConsumableBody
  // ) {
  //   return await this.apiTicketSpaService.changeConsumable({
  //     oid,
  //     ticketId: id,
  //     body,
  //   })
  // }

  // @Post(':id/change-prescription')
  // @HasPermission(PermissionId.TICKET_SPA_UPDATE_PRESCRIPTION)
  // async changePrescription(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketSpaChangePrescriptionBody
  // ) {
  //   return await this.apiTicketSpaService.changePrescription({
  //     oid,
  //     ticketId: id,
  //     body,
  //   })
  // }

  // @Post(':id/change-items-money')
  // @HasPermission(PermissionId.TICKET_SPA_UPDATE_ITEMS_MONEY)
  // async changeItemsMoney(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketSpaChangeItemsMoneyBody
  // ) {
  //   return await this.apiTicketSpaService.changeItemsMoney({ oid, ticketId: id, body })
  // }

  // @Post(':id/send-product')
  // @HasPermission(PermissionId.TICKET_SPA_SEND_PRODUCT)
  // async sendProduct(@External() { oid }: TExternal, @Param() { id }: IdParam) {
  //   return await this.apiTicketSpaService.sendProduct({ oid, ticketId: id })
  // }

  // @Post(':id/return-product')
  // @HasPermission(PermissionId.TICKET_SPA_RETURN_PRODUCT)
  // async returnProduct(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketSpaReturnProductListBody
  // ) {
  //   return await this.apiTicketSpaService.returnProduct({ oid, ticketId: id, body })
  // }

  // @Post(':id/prepayment')
  // @HasPermission(PermissionId.TICKET_SPA_PREPAYMENT)
  // async prepayment(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketSpaPaymentBody
  // ) {
  //   return await this.apiTicketSpaService.prepayment({ oid, ticketId: id, body })
  // }

  // @Post(':id/refund-overpaid')
  // @HasPermission(PermissionId.TICKET_SPA_REFUND_OVERPAID)
  // async refundOverpaid(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketSpaPaymentBody
  // ) {
  //   return await this.apiTicketSpaService.refundOverpaid({ oid, ticketId: id, body })
  // }

  // @Post(':id/pay-debt')
  // @HasPermission(PermissionId.TICKET_SPA_PAY_DEBT)
  // async payDebt(
  //   @External() { oid }: TExternal,
  //   @Param() { id }: IdParam,
  //   @Body() body: TicketSpaPaymentBody
  // ) {
  //   return await this.apiTicketSpaService.payDebt({ oid, ticketId: id, body })
  // }

  // @Post(':id/close')
  // @HasPermission(PermissionId.TICKET_SPA_CLOSE)
  // async close(@External() { oid }: TExternal, @Param() { id }: IdParam) {
  //   return await this.apiTicketSpaService.close({ oid, ticketId: id })
  // }

  // @Post(':id/reopen')
  // @HasPermission(PermissionId.TICKET_SPA_READ)
  // async reopen(@External() { oid }: TExternal, @Param() { id }: IdParam) {
  //   return await this.apiTicketSpaService.reopen({ oid, ticketId: id })
  // }

  // @Delete(':id/destroy-draft-schedule')
  // @HasPermission(PermissionId.TICKET_SPA_DESTROY_DRAFT_SCHEDULE)
  // async destroyDraftSchedule(@External() { oid }: TExternal, @Param() { id }: IdParam) {
  //   return await this.apiTicketSpaService.destroyDraftSchedule({ oid, ticketId: id })
  // }
}
