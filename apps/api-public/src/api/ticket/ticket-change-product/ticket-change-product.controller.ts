import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { TicketProductType } from '../../../../../_libs/database/entities/ticket-product.entity'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketParams } from '../ticket-query/request'
import {
  TicketAddTicketProductListBody,
  TicketChangeProductParams,
  TicketUpdatePriorityTicketProductBody,
  TicketUpdateTicketProductBody,
} from './request'
import { TicketAddTicketProductService } from './service/ticket-add-ticket-product-list.service'
import { TicketChangeProductService } from './ticket-change-product.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class TicketChangeProductController {
  constructor(
    private readonly ticketChangeProductService: TicketChangeProductService,
    private readonly ticketAddTicketProductService: TicketAddTicketProductService
  ) { }

  @Post(':ticketId/consumable/add-ticket-product-consumable-list')
  @UserPermission(PermissionId.TICKET_CHANGE_PRODUCT_CONSUMABLE)
  async addTicketProductConsumable(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketAddTicketProductListBody
  ): Promise<BaseResponse> {
    const data = await this.ticketAddTicketProductService.addTicketProductList({
      oid,
      ticketId,
      ticketProductType: TicketProductType.Consumable,
      body,
    })
    return { data }
  }

  @Post(':ticketId/prescription/add-ticket-product-prescription-list')
  @UserPermission(PermissionId.TICKET_CHANGE_PRODUCT_PRESCRIPTION)
  async addTicketProductPrescription(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketAddTicketProductListBody
  ): Promise<BaseResponse> {
    const data = await this.ticketAddTicketProductService.addTicketProductList({
      oid,
      ticketId,
      ticketProductType: TicketProductType.Prescription,
      body,
    })
    return { data }
  }

  @Post(':ticketId/consumable/destroy-ticket-product-consumable/:ticketProductId')
  @UserPermission(PermissionId.TICKET_CHANGE_PRODUCT_CONSUMABLE)
  async destroyTicketProductConsumable(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProductId }: TicketChangeProductParams
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProductService.destroyTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      ticketProductType: TicketProductType.Consumable,
    })
    return { data }
  }

  @Post(':ticketId/prescription/destroy-ticket-product-prescription/:ticketProductId')
  @UserPermission(PermissionId.TICKET_CHANGE_PRODUCT_PRESCRIPTION)
  async destroyTicketProductPrescription(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProductId }: TicketChangeProductParams
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProductService.destroyTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      ticketProductType: TicketProductType.Prescription,
    })
    return { data }
  }

  @Post(':ticketId/consumable/update-priority-ticket-product-consumable')
  @UserPermission(PermissionId.TICKET_CHANGE_PRODUCT_CONSUMABLE)
  async updatePriorityTicketProductConsumable(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketUpdatePriorityTicketProductBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProductService.updatePriorityTicketProduct({
      oid,
      ticketId,
      ticketProductType: TicketProductType.Consumable,
      body,
    })
    return { data }
  }

  @Post(':ticketId/prescription/update-priority-ticket-product-prescription')
  @UserPermission(PermissionId.TICKET_CHANGE_PRODUCT_PRESCRIPTION)
  async updatePriorityTicketProductPrescription(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketUpdatePriorityTicketProductBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProductService.updatePriorityTicketProduct({
      oid,
      ticketId,
      ticketProductType: TicketProductType.Prescription,
      body,
    })
    return { data }
  }

  @Post(':ticketId/consumable/update-ticket-product-consumable/:ticketProductId')
  @UserPermission(PermissionId.TICKET_CHANGE_PRODUCT_CONSUMABLE)
  async updateTicketProductConsumable(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProductId }: TicketChangeProductParams,
    @Body() body: TicketUpdateTicketProductBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProductService.updateTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      ticketProductType: TicketProductType.Consumable,
      body,
    })
    return { data }
  }

  @Post(':ticketId/prescription/update-ticket-product-prescription/:ticketProductId')
  @UserPermission(PermissionId.TICKET_CHANGE_PRODUCT_PRESCRIPTION)
  async updateTicketProductPrescription(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProductId }: TicketChangeProductParams,
    @Body() body: TicketUpdateTicketProductBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProductService.updateTicketProduct({
      oid,
      ticketId,
      ticketProductId,
      ticketProductType: TicketProductType.Prescription,
      body,
    })
    return { data }
  }
}
