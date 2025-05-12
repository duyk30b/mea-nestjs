import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiFileCustomerDownloadExcel } from './api-file-customer.download-excel'

@ApiTags('FileCustomer')
@ApiBearerAuth('access-token')
@Controller('file-customer')
export class ApiFileCustomerController {
  constructor(
    private readonly apiFileCustomerDownloadExcel: ApiFileCustomerDownloadExcel
  ) { }

  @Get('download-excel')
  @HasPermission(PermissionId.FILE_CUSTOMER_DOWNLOAD_EXCEL)
  async downloadExcel(@External() { user, organization }: TExternal) {
    return await this.apiFileCustomerDownloadExcel.downloadExcel({ organization, user })
  }
}
