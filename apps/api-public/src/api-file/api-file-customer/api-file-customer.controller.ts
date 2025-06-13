import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiFileCustomerDownloadExcel } from './api-file-customer.download-excel'

@ApiTags('FileCustomer')
@ApiBearerAuth('access-token')
@Controller('file-customer')
export class ApiFileCustomerController {
  constructor(
    private readonly apiFileCustomerDownloadExcel: ApiFileCustomerDownloadExcel
  ) { }

  @Get('download-excel')
  @UserPermission(PermissionId.FILE_EXCEL_DOWNLOAD_CUSTOMER)
  async downloadExcel(@External() { user, organization }: TExternal) {
    return await this.apiFileCustomerDownloadExcel.downloadExcel({ organization, user })
  }
}
