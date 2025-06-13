import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileUploadDto, SingleFileUpload } from '../../../../_libs/common/dto/file'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { FastifyFileInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiFileProductDownloadExcel } from '../api-file-product/api-file-product.download-excel'
import { ApiFileReceiptUploadExcel } from './api-file-receipt.upload-excel'

@ApiTags('FileReceipt')
@ApiBearerAuth('access-token')
@Controller('file-receipt')
export class ApiFileReceiptController {
  constructor(
    private readonly apiFileReceiptUploadExcel: ApiFileReceiptUploadExcel,
    private readonly apiFileProductDownloadExcel: ApiFileProductDownloadExcel
  ) { }

  @Get('download-excel/file-example-receipt-item')
  @UserPermission(PermissionId.FILE_EXCEL_UPLOAD_RECEIPT)
  async downloadExcelFileExample(@External() { user, organization }: TExternal) {
    return await this.apiFileProductDownloadExcel.downloadExcel({ oid: 1 })
  }

  @Post('upload-excel/generate-receipt-item-list')
  @UserPermission(PermissionId.FILE_EXCEL_UPLOAD_RECEIPT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('file', {}))
  async uploadExcelForGenerateReceiptItemList(
    @External() { uid, oid }: TExternal,
    @UploadedFile() file: FileUploadDto,
    @Body() body: SingleFileUpload
  ) {
    return await this.apiFileReceiptUploadExcel.uploadExcelForGenerateReceiptItemList({
      oid,
      userId: uid,
      file,
    })
  }
}
