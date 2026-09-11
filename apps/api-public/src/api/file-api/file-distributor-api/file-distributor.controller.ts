import { DistributorGetManyQuery } from '@api-public/resource/distributor-resource/distributor-get.query'
import { UserPermission } from '@libs/common/guards/user.guard'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { FileDistributorDownloadExcel } from './file-distributor.download-excel'

@ApiTags('FileDistributor')
@ApiBearerAuth('access-token')
@Controller('file-distributor')
export class FileDistributorController {
  constructor(private readonly fileDistributorDownloadExcel: FileDistributorDownloadExcel) {}

  @Get('download-excel')
  @UserPermission(PermissionId.FILE_EXCEL_DOWNLOAD_DISTRIBUTOR)
  async downloadExcel(
    @External() { oid, user, organization }: TExternal,
    @Query() query: DistributorGetManyQuery
  ) {
    return await this.fileDistributorDownloadExcel.downloadExcel(oid, query)
  }
}
