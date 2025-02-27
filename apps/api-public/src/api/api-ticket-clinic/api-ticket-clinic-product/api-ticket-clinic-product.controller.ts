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
  TicketClinicReturnProductListBody,
  TicketClinicUpdatePriorityTicketProductBody,
  TicketClinicUpdateTicketProductBody,
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
  async destroyTicketProductConsumable(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProductId }: TicketClinicProductParams
  ) {
    return await this.apiTicketClinicProductService.destroyTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      ticketProductType: TicketProductType.Consumable,
    })
  }

  @Delete(':ticketId/destroy-ticket-product-prescription/:ticketProductId')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_PRESCRIPTION)
  async destroyTicketProductPrescription(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProductId }: TicketClinicProductParams
  ) {
    return await this.apiTicketClinicProductService.destroyTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      ticketProductType: TicketProductType.Prescription,
    })
  }

  @Post(':id/update-priority-ticket-product-consumable')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_CONSUMABLE)
  async updatePriorityTicketProductConsumable(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdatePriorityTicketProductBody
  ) {
    return await this.apiTicketClinicProductService.updatePriorityTicketProduct({
      oid,
      ticketId: id,
      ticketProductType: TicketProductType.Consumable,
      body,
    })
  }

  @Post(':id/update-priority-ticket-product-prescription')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_PRESCRIPTION)
  async updatePriorityTicketProductPrescription(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdatePriorityTicketProductBody
  ) {
    return await this.apiTicketClinicProductService.updatePriorityTicketProduct({
      oid,
      ticketId: id,
      ticketProductType: TicketProductType.Prescription,
      body,
    })
  }

  @Post(':ticketId/update-ticket-product-consumable/:ticketProductId')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_CONSUMABLE)
  async updateTicketProductConsumable(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProductId }: TicketClinicProductParams,
    @Body() body: TicketClinicUpdateTicketProductBody
  ) {
    return await this.apiTicketClinicProductService.updateTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      ticketProductType: TicketProductType.Consumable,
      body,
    })
  }

  @Post(':ticketId/update-ticket-product-prescription/:ticketProductId')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_PRODUCT_PRESCRIPTION)
  async updateTicketProductPrescription(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProductId }: TicketClinicProductParams,
    @Body() body: TicketClinicUpdateTicketProductBody
  ) {
    return await this.apiTicketClinicProductService.updateTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      ticketProductType: TicketProductType.Prescription,
      body,
    })
  }

  @Post(':id/send-product')
  @HasPermission(PermissionId.TICKET_CLINIC_SEND_PRODUCT)
  async sendProduct(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicProductService.sendProduct({ oid, ticketId: id })
  }

  @Post(':id/return-product')
  @HasPermission(PermissionId.TICKET_CLINIC_RETURN_PRODUCT)
  async returnProduct(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicReturnProductListBody
  ) {
    return await this.apiTicketClinicProductService.returnProduct({ oid, ticketId: id, body })
  }
}
