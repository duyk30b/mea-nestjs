import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileUploadDto, SingleFileUpload } from '../../../../_libs/common/dto/file'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { FastifyFileInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiFileProductDownloadExcel } from './api-file-product.download-excel'
import { ApiFileProductUploadExcel } from './api-file-product.upload-excel'

@ApiTags('FileProduct')
@ApiBearerAuth('access-token')
@Controller('file-product')
export class ApiFileProductController {
  constructor(
    private readonly apiFileProductDownloadExcel: ApiFileProductDownloadExcel,
    private readonly apiFileProductUploadExcel: ApiFileProductUploadExcel
  ) { }

  @Get('download-excel')
  @UserPermission(PermissionId.FILE_EXCEL_DOWNLOAD_PRODUCT)
  async downloadExcel(@External() { oid, user, organization }: TExternal) {
    return await this.apiFileProductDownloadExcel.downloadExcel({ oid })
  }

  @Get('download-excel/file-example')
  @UserPermission(PermissionId.FILE_EXCEL_UPLOAD_PRODUCT)
  async uploadExcelFileExample(@External() { user, organization }: TExternal) {
    return await this.apiFileProductDownloadExcel.downloadExcel({ oid: 1 })
  }

  @Post('upload-excel')
  @UserPermission(PermissionId.FILE_EXCEL_UPLOAD_PRODUCT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('file', {}))
  async uploadExcel(
    @External() { uid, oid }: TExternal,
    @UploadedFile() file: FileUploadDto,
    @Body() body: SingleFileUpload
  ) {
    return await this.apiFileProductUploadExcel.uploadExcel({ oid, userId: uid, file })
  }
}
