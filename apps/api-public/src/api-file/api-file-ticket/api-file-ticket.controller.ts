import { UserPermission } from '@libs/common/guards/user.guard'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { TicketGetManyQuery } from '../../api/ticket/ticket-query/request'
import { ApiFileTicketDownloadExcel } from './api-file-ticket.download-excel'

@ApiTags('FileTicket')
@ApiBearerAuth('access-token')
@Controller('file-ticket')
export class ApiFileTicketController {
  constructor(private readonly apiFileTicketDownloadExcel: ApiFileTicketDownloadExcel) { }

  @Get('download-excel')
  @UserPermission(PermissionId.FILE_EXCEL_DOWNLOAD_TICKET_ORDER)
  async downloadExcel(
    @External() { user, organization }: TExternal,
    @Query() query: TicketGetManyQuery
  ) {
    return await this.apiFileTicketDownloadExcel.downloadExcel({ organization, user, query })
  }
}
