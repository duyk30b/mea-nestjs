import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileUploadDto, SingleFileUpload } from '../../../../_libs/common/dto/file'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { FastifyFileInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
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
  @HasPermission(PermissionId.FILE_PRODUCT_DOWNLOAD_EXCEL)
  async downloadExcel(@External() { user, organization }: TExternal) {
    return await this.apiFileProductDownloadExcel.downloadExcel({ organization, user })
  }

  @Get('upload-excel/file-example')
  @HasPermission(PermissionId.FILE_PRODUCT_UPLOAD_EXCEL)
  async uploadExcelFileExample(@External() { user, organization }: TExternal) {
    return await this.apiFileProductUploadExcel.fileExample()
  }

  @Post('upload-excel')
  @HasPermission(PermissionId.FILE_PRODUCT_UPLOAD_EXCEL)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('file', {}))
  async uploadExcel(
    @External() { user, oid }: TExternal,
    @UploadedFile() file: FileUploadDto,
    @Body() body: SingleFileUpload
  ) {
    return await this.apiFileProductUploadExcel.uploadExcel({ oid, user, file })
  }
}
