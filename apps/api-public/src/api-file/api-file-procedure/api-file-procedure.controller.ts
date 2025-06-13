import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileUploadDto, SingleFileUpload } from '../../../../_libs/common/dto/file'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { FastifyFileInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiFileProcedureDownloadExcel } from './api-file-procedure.download-excel'
import { ApiFileProcedureUploadExcel } from './api-file-procedure.upload-excel'

@ApiTags('FileProcedure')
@ApiBearerAuth('access-token')
@Controller('file-procedure')
export class ApiFileProcedureController {
  constructor(
    private readonly apiFileProcedureDownloadExcel: ApiFileProcedureDownloadExcel,
    private readonly apiFileProcedureUploadExcel: ApiFileProcedureUploadExcel
  ) { }

  @Get('download-excel')
  @UserPermission(PermissionId.FILE_EXCEL_DOWNLOAD_PROCEDURE)
  async downloadExcel(@External() { oid, user, organization }: TExternal) {
    return await this.apiFileProcedureDownloadExcel.downloadExcel({ oid })
  }

  @Get('download-excel/file-example')
  @UserPermission(PermissionId.FILE_EXCEL_UPLOAD_PROCEDURE)
  async uploadExcelFileExample(@External() { user, organization }: TExternal) {
    return await this.apiFileProcedureDownloadExcel.downloadExcel({ oid: 1 })
  }

  @Post('upload-excel')
  @UserPermission(PermissionId.FILE_EXCEL_UPLOAD_PROCEDURE)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('file', {}))
  async uploadExcel(
    @External() { uid, oid }: TExternal,
    @UploadedFile() file: FileUploadDto,
    @Body() body: SingleFileUpload
  ) {
    return await this.apiFileProcedureUploadExcel.uploadExcel({ oid, userId: uid, file })
  }
}
