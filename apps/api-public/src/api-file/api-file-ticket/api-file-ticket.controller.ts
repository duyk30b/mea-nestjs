import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { TicketGetManyQuery } from '../../api/api-ticket/request'
import { ApiFileTicketDownloadExcel } from './api-file-ticket.download-excel'

@ApiTags('FileTicket')
@ApiBearerAuth('access-token')
@Controller('file-ticket')
export class ApiFileTicketController {
  constructor(private readonly apiFileTicketDownloadExcel: ApiFileTicketDownloadExcel) { }

  @Get('ticket-oder/download-excel')
  @UserPermission(PermissionId.FILE_EXCEL_DOWNLOAD_TICKET_ORDER)
  async ticketOrderDownloadExcel(
    @External() { user, organization }: TExternal,
    @Query() query: TicketGetManyQuery
  ) {
    return await this.apiFileTicketDownloadExcel.downloadExcel({ organization, user, query })
  }

  @Get('ticket-clinic/download-excel')
  @UserPermission(PermissionId.FILE_EXCEL_DOWNLOAD_TICKET_CLINIC)
  async ticketClinicDownloadExcel(
    @External() { user, organization }: TExternal,
    @Query() query: TicketGetManyQuery
  ) {
    return await this.apiFileTicketDownloadExcel.downloadExcel({ organization, user, query })
  }
}
