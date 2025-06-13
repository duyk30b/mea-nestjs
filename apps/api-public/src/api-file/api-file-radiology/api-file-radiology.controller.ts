import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileUploadDto, SingleFileUpload } from '../../../../_libs/common/dto/file'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { FastifyFileInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiFileRadiologyDownloadExcel } from './api-file-radiology.download-excel'
import { ApiFileRadiologyUploadExcel } from './api-file-radiology.upload-excel'

@ApiTags('FileRadiology')
@ApiBearerAuth('access-token')
@Controller('file-radiology')
export class ApiFileRadiologyController {
  constructor(
    private readonly apiFileRadiologyDownloadExcel: ApiFileRadiologyDownloadExcel,
    private readonly apiFileRadiologyUploadExcel: ApiFileRadiologyUploadExcel
  ) { }

  @Get('download-excel')
  @UserPermission(PermissionId.FILE_EXCEL_DOWNLOAD_RADIOLOGY)
  async downloadExcel(@External() { oid, user, organization }: TExternal) {
    return await this.apiFileRadiologyDownloadExcel.downloadExcel({ oid })
  }

  @Get('download-excel/file-example')
  @UserPermission(PermissionId.FILE_EXCEL_UPLOAD_RADIOLOGY)
  async uploadExcelFileExample(@External() { user, organization }: TExternal) {
    return await this.apiFileRadiologyDownloadExcel.downloadExcel({ oid: 1 })
  }

  @Post('upload-excel')
  @UserPermission(PermissionId.FILE_EXCEL_UPLOAD_RADIOLOGY)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('file', {}))
  async uploadExcel(
    @External() { uid, oid }: TExternal,
    @UploadedFile() file: FileUploadDto,
    @Body() body: SingleFileUpload
  ) {
    return await this.apiFileRadiologyUploadExcel.uploadExcel({ oid, userId: uid, file })
  }
}
