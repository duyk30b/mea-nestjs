import { Body, Controller, Delete, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { HasPermission } from '../../../../../_libs/common/guards/permission.guard'
import { FastifyFilesInterceptor } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/database/entities/permission.entity'
import { ApiTicketClinicRadiologyService } from './api-ticket-clinic-radiology.service'
import {
  TicketClinicAddTicketRadiologyBody,
  TicketClinicRadiologyParams,
  TicketClinicUpdatePriorityTicketRadiologyBody,
  TicketClinicUpdateTicketRadiologyBody,
} from './request'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicRadiologyController {
  constructor(private readonly apiTicketClinicRadiologyService: ApiTicketClinicRadiologyService) { }

  @Post(':id/add-ticket-radiology')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY_LIST)
  async addTicketRadiology(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicAddTicketRadiologyBody
  ) {
    return await this.apiTicketClinicRadiologyService.addTicketRadiology({
      oid,
      ticketId: id,
      body,
    })
  }

  @Delete(':ticketId/destroy-ticket-radiology/:ticketRadiologyId')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY_LIST)
  async destroyTicketRadiology(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketRadiologyId }: TicketClinicRadiologyParams
  ) {
    return await this.apiTicketClinicRadiologyService.destroyTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyId,
    })
  }

  @Post(':ticketId/update-ticket-radiology/:ticketRadiologyId')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY_LIST)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async updateTicketRadiology(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketRadiologyId }: TicketClinicRadiologyParams,
    @Body() body: TicketClinicUpdateTicketRadiologyBody,
    @UploadedFiles() files: FileUploadDto[]
  ) {
    return await this.apiTicketClinicRadiologyService.updateTicketRadiology({
      oid,
      ticketId,
      ticketRadiologyId,
      body,
      files,
    })
  }

  @Post(':id/update-priority-ticket-radiology')
  @HasPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_RADIOLOGY_LIST)
  async updatePriorityTicketRadiology(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdatePriorityTicketRadiologyBody
  ) {
    return await this.apiTicketClinicRadiologyService.updatePriorityTicketRadiology({
      oid,
      ticketId: id,
      body,
    })
  }
}
