import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { HasPermission } from '../../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/database/entities/permission.entity'
import { TicketProductType } from '../../../../../_libs/database/entities/ticket-product.entity'
import { ApiTicketClinicProductService } from './api-ticket-clinic-product.service'
import {
  TicketClinicAddTicketProductListBody,
  TicketClinicProductParams,
  TicketClinicUpdateTicketProductBody,
  TicketClinicUpdateTicketProductListBody,
} from './request'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicProductController {
  constructor(private readonly apiTicketClinicProductService: ApiTicketClinicProductService) { }

  @Post(':id/add-ticket-product-consumable-list')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_CONSUMABLE)
  async addTicketProductConsumable(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicAddTicketProductListBody
  ) {
    return await this.apiTicketClinicProductService.addTicketProductList({
      oid,
      ticketId: id,
      ticketProductType: TicketProductType.Consumable,
      body,
    })
  }

  @Post(':id/add-ticket-product-prescription-list')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_PRESCRIPTION)
  async addTicketProductPrescription(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicAddTicketProductListBody
  ) {
    return await this.apiTicketClinicProductService.addTicketProductList({
      oid,
      ticketId: id,
      ticketProductType: TicketProductType.Prescription,
      body,
    })
  }

  @Delete(':ticketId/destroy-ticket-product-consumable/:ticketProductId')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_CONSUMABLE)
  async destroyTicketProduct(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProductId }: TicketClinicProductParams
  ) {
    return await this.apiTicketClinicProductService.destroyTicketProduct({
      oid,
      ticketId,
      ticketProductId,
    })
  }

  @Post(':ticketId/update-ticket-product-consumable/:ticketProductId')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_CONSUMABLE)
  async updateTicketProduct(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProductId }: TicketClinicProductParams,
    @Body() body: TicketClinicUpdateTicketProductBody
  ) {
    return await this.apiTicketClinicProductService.updateTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      body,
    })
  }

  @Post(':id/update-ticket-product-consumable-list')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_CONSUMABLE)
  async updateTicketProductConsumableList(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateTicketProductListBody
  ) {
    return await this.apiTicketClinicProductService.updateTicketProductList({
      oid,
      ticketId: id,
      ticketProductType: TicketProductType.Consumable,
      body,
    })
  }

  @Post(':id/update-ticket-product-prescription-list')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_PRESCRIPTION)
  async updateTicketProductPrescriptionList(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateTicketProductListBody
  ) {
    return await this.apiTicketClinicProductService.updateTicketProductList({
      oid,
      ticketId: id,
      ticketProductType: TicketProductType.Prescription,
      body,
    })
  }
}
