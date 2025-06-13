import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileUploadDto, SingleFileUpload } from '../../../../_libs/common/dto/file'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { FastifyFileInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiFileCustomerDownloadExcel } from './api-file-customer.download-excel'
import { ApiFileCustomerUploadExcel } from './api-file-customer.upload-excel'

@ApiTags('FileCustomer')
@ApiBearerAuth('access-token')
@Controller('file-customer')
export class ApiFileCustomerController {
  constructor(
    private readonly apiFileCustomerDownloadExcel: ApiFileCustomerDownloadExcel,
    private readonly apiFileCustomerUploadExcel: ApiFileCustomerUploadExcel
  ) { }

  @Get('download-excel')
  @UserPermission(PermissionId.FILE_EXCEL_DOWNLOAD_CUSTOMER)
  async downloadExcel(@External() { oid, user, organization }: TExternal) {
    return await this.apiFileCustomerDownloadExcel.downloadExcel({ oid })
  }

  @Get('download-excel/file-example')
  @UserPermission(PermissionId.FILE_EXCEL_UPLOAD_CUSTOMER)
  async uploadExcelFileExample(@External() { user, organization }: TExternal) {
    return await this.apiFileCustomerDownloadExcel.downloadExcel({ oid: 1 })
  }

  @Post('upload-excel')
  @UserPermission(PermissionId.FILE_EXCEL_UPLOAD_CUSTOMER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('file', {}))
  async uploadExcel(
    @External() { uid, oid }: TExternal,
    @UploadedFile() file: FileUploadDto,
    @Body() body: SingleFileUpload
  ) {
    return await this.apiFileCustomerUploadExcel.uploadExcel({ oid, userId: uid, file })
  }
}
