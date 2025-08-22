import { Body, Controller, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse, FastifyFilesInterceptor } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketParams } from '../ticket-query/request'
import { TicketUpdateDiagnosisBody, TicketUpdateTicketAttributeListBody } from './request'
import { TicketChangeAttributeService } from './ticket-change-attribute.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class TicketChangeAttributeController {
  constructor(private readonly ticketChangeAttributeService: TicketChangeAttributeService) { }

  @Post(':ticketId/attribute/update-diagnosis')
  @UserPermission(PermissionId.TICKET_CHANGE_ATTRIBUTE)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async updateDiagnosisBasic(
    @External() { oid }: TExternal,
    @UploadedFiles() files: FileUploadDto[],
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketUpdateDiagnosisBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeAttributeService.updateDiagnosis({
      oid,
      ticketId,
      body,
      files,
    })
    return { data }
  }

  @Post(':ticketId/attribute/update-ticket-attribute-list')
  @UserPermission(PermissionId.TICKET_CHANGE_ATTRIBUTE)
  async updateTicketAttributeList(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketUpdateTicketAttributeListBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeAttributeService.updateTicketAttributeList({
      oid,
      ticketId,
      body,
    })
    return { data }
  }
}
