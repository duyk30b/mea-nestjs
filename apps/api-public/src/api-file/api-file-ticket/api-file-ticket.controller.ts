import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { TicketGetManyQuery } from '../../api/api-ticket/request'
import { ApiFileTicketDownloadExcel } from './api-file-ticket.download-excel'

@ApiTags('FileTicket')
@ApiBearerAuth('access-token')
@Controller('file-ticket')
export class ApiFileTicketController {
  constructor(private readonly apiFileTicketDownloadExcel: ApiFileTicketDownloadExcel) { }

  @Get('ticket-oder/download-excel')
  @HasPermission(PermissionId.FILE_TICKET_ORDER_DOWNLOAD_EXCEL)
  async ticketOrderDownloadExcel(
    @External() { user, organization }: TExternal,
    @Query() query: TicketGetManyQuery
  ) {
    return await this.apiFileTicketDownloadExcel.downloadExcel({ organization, user, query })
  }

  @Get('ticket-clinic/download-excel')
  @HasPermission(PermissionId.FILE_TICKET_CLINIC_DOWNLOAD_EXCEL)
  async ticketClinicDownloadExcel(
    @External() { user, organization }: TExternal,
    @Query() query: TicketGetManyQuery
  ) {
    return await this.apiFileTicketDownloadExcel.downloadExcel({ organization, user, query })
  }
}
