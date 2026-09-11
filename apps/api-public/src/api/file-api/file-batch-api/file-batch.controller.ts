import { BatchGetManyQuery } from '@api-public/resource/batch-resource/batch-get.query'
import { UserPermission } from '@libs/common/guards/user.guard'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { FileBatchDownloadExcel } from './file-batch.download-excel'

@ApiTags('FileBatch')
@ApiBearerAuth('access-token')
@Controller('file-batch')
export class FileBatchController {
  constructor(private readonly fileBatchDownloadExcel: FileBatchDownloadExcel) {}

  @Get('download-excel')
  @UserPermission(PermissionId.FILE_EXCEL_DOWNLOAD_PRODUCT)
  async downloadExcel(
    @External() { oid, user, organization }: TExternal,
    @Query() query: BatchGetManyQuery
  ) {
    return await this.fileBatchDownloadExcel.downloadExcel(oid, query)
  }
}
