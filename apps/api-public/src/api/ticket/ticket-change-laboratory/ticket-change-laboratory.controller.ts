import { Body, Controller, Delete, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketLaboratoryGroupPostQuery } from '../../api-ticket-laboratory-group/request'
import { TicketParams } from '../ticket-query/request/ticket.params'
import {
  TicketAddTicketLaboratoryGroupBody,
  TicketChangeLaboratoryGroupParams,
  TicketChangeLaboratoryParams,
  TicketUpdatePriorityTicketLaboratoryBody,
  TicketUpdateRequestTicketLaboratoryBody,
  TicketUpdateResultLaboratoryGroupBody,
  TicketUpdateTicketLaboratoryGroupBody,
} from './request'
import { TicketAddTicketLaboratoryGroupService } from './service/ticket-add-ticket-laboratory-group.service'
import { TicketUpdateRequestTicketLaboratoryService } from './service/ticket-update-request-ticket-laboratory.service'
import { TicketUpdateTicketLaboratoryGroupService } from './service/ticket-update-ticket-laboratory-group.service'
import { TicketChangeLaboratoryService } from './ticket-change-laboratory.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class TicketChangeLaboratoryController {
  constructor(
    private readonly ticketChangeLaboratoryService: TicketChangeLaboratoryService,
    private readonly ticketAddTicketLaboratoryGroupService: TicketAddTicketLaboratoryGroupService,
    private readonly ticketUpdateTicketLaboratoryGroupService: TicketUpdateTicketLaboratoryGroupService,
    private readonly ticketUpdateRequestTicketLaboratoryService: TicketUpdateRequestTicketLaboratoryService
  ) { }

  @Post(':ticketId/laboratory/add-ticket-laboratory-group')
  @UserPermission(PermissionId.TICKET_CHANGE_LABORATORY_REQUEST)
  async addTicketLaboratoryGroup(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketAddTicketLaboratoryGroupBody
  ): Promise<BaseResponse> {
    const data = await this.ticketAddTicketLaboratoryGroupService.addTicketLaboratoryGroup({
      oid,
      ticketId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/laboratory/update-ticket-laboratory-group')
  @UserPermission(PermissionId.TICKET_CHANGE_LABORATORY_REQUEST)
  async updateTicketLaboratoryGroup(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketUpdateTicketLaboratoryGroupBody
  ): Promise<BaseResponse> {
    const data = await this.ticketUpdateTicketLaboratoryGroupService.updateTicketLaboratoryGroup({
      oid,
      ticketId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/laboratory/destroy-ticket-laboratory/:ticketLaboratoryId')
  @UserPermission(PermissionId.TICKET_CHANGE_LABORATORY_REQUEST)
  async destroyTicketLaboratory(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketLaboratoryId }: TicketChangeLaboratoryParams
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeLaboratoryService.destroyTicketLaboratory({
      oid,
      ticketId,
      ticketLaboratoryId,
    })
    return { data }
  }

  @Post(':ticketId/laboratory/destroy-ticket-laboratory-group/:ticketLaboratoryGroupId')
  @UserPermission(PermissionId.TICKET_CHANGE_LABORATORY_REQUEST)
  async destroyTicketLaboratoryGroup(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketLaboratoryGroupId }: TicketChangeLaboratoryGroupParams
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeLaboratoryService.destroyTicketLaboratoryGroup({
      oid,
      ticketId,
      ticketLaboratoryGroupId,
    })
    return { data }
  }

  @Post(':ticketId/laboratory/update-request-ticket-laboratory/:ticketLaboratoryId')
  @UserPermission(PermissionId.TICKET_CHANGE_LABORATORY_REQUEST)
  async updateRequestTicketLaboratory(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketLaboratoryId }: TicketChangeLaboratoryParams,
    @Body() body: TicketUpdateRequestTicketLaboratoryBody
  ): Promise<BaseResponse> {
    const data = await this.ticketUpdateRequestTicketLaboratoryService.updateRequestTicketLaboratory({
      oid,
      ticketId,
      ticketLaboratoryId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/laboratory/update-priority-ticket-laboratory')
  @UserPermission(PermissionId.TICKET_CHANGE_LABORATORY_REQUEST)
  async updatePriorityTicketLaboratory(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketUpdatePriorityTicketLaboratoryBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeLaboratoryService.updatePriorityTicketLaboratory({
      oid,
      ticketId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/laboratory/update-result/:ticketLaboratoryGroupId')
  @UserPermission(PermissionId.TICKET_CHANGE_LABORATORY_RESULT)
  async updateResultTicketLaboratory(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketLaboratoryGroupId }: TicketChangeLaboratoryGroupParams,
    @Body() body: TicketUpdateResultLaboratoryGroupBody,
    @Query() query: TicketLaboratoryGroupPostQuery
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeLaboratoryService.updateResult({
      oid,
      ticketId,
      ticketLaboratoryGroupId,
      body,
      query,
    })
    return { data }
  }

  @Post(':ticketId/laboratory/cancel-result/:ticketLaboratoryGroupId')
  @UserPermission(PermissionId.TICKET_CHANGE_LABORATORY_RESULT)
  async cancelResultTicketLaboratory(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketLaboratoryGroupId }: TicketChangeLaboratoryGroupParams
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeLaboratoryService.cancelResult({
      oid,
      ticketId,
      ticketLaboratoryGroupId,
    })
    return { data }
  }
}
