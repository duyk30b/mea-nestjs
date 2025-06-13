import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileUploadDto, SingleFileUpload } from '../../../../_libs/common/dto/file'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { FastifyFileInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiFileLaboratoryDownloadExcel } from './api-file-laboratory.download-excel'
import { ApiFileLaboratoryUploadExcel } from './api-file-laboratory.upload-excel'

@ApiTags('FileLaboratory')
@ApiBearerAuth('access-token')
@Controller('file-laboratory')
export class ApiFileLaboratoryController {
  constructor(
    private readonly apiFileLaboratoryDownloadExcel: ApiFileLaboratoryDownloadExcel,
    private readonly apiFileLaboratoryUploadExcel: ApiFileLaboratoryUploadExcel
  ) { }

  @Get('download-excel')
  @UserPermission(PermissionId.FILE_EXCEL_DOWNLOAD_LABORATORY)
  async downloadExcel(@External() { oid, user, organization }: TExternal) {
    return await this.apiFileLaboratoryDownloadExcel.downloadExcel({ oid })
  }

  @Get('download-excel/file-example')
  @UserPermission(PermissionId.FILE_EXCEL_UPLOAD_LABORATORY)
  async uploadExcelFileExample(@External() { user, organization }: TExternal) {
    return await this.apiFileLaboratoryDownloadExcel.downloadExcel({ oid: 1 })
  }

  @Post('upload-excel')
  @UserPermission(PermissionId.FILE_EXCEL_UPLOAD_LABORATORY)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('file', {}))
  async uploadExcel(
    @External() { uid, oid }: TExternal,
    @UploadedFile() file: FileUploadDto,
    @Body() body: SingleFileUpload
  ) {
    return await this.apiFileLaboratoryUploadExcel.uploadExcel({ oid, userId: uid, file })
  }
}
