import { FileUploadDto, SingleFileUpload } from '@libs/common/dto/file'
import { UserPermission } from '@libs/common/guards/user.guard'
import { FastifyFileInterceptor } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { ApiFileProductDownloadExcel } from '../api-file-product/api-file-product.download-excel'
import { ApiFilePurchaseOrderUploadExcel } from './api-file-purchase-order.upload-excel'

@ApiTags('FilePurchaseOrder')
@ApiBearerAuth('access-token')
@Controller('file-purchase-order')
export class ApiFilePurchaseOrderController {
  constructor(
    private readonly apiFilePurchaseOrderUploadExcel: ApiFilePurchaseOrderUploadExcel,
    private readonly apiFileProductDownloadExcel: ApiFileProductDownloadExcel
  ) { }

  @Get('download-excel/file-example-purchase-order-item')
  @UserPermission(PermissionId.FILE_EXCEL_UPLOAD_PURCHASE_ORDER)
  async downloadExcelFileExample(@External() { user, organization }: TExternal) {
    return await this.apiFileProductDownloadExcel.downloadExcel({ oid: 1 })
  }

  @Post('upload-excel/generate-purchase-order-item-list')
  @UserPermission(PermissionId.FILE_EXCEL_UPLOAD_PURCHASE_ORDER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('file', {}))
  async uploadExcelForGeneratePurchaseOrderItemList(
    @External() { uid, oid }: TExternal,
    @UploadedFile() file: FileUploadDto,
    @Body() body: SingleFileUpload
  ) {
    return await this.apiFilePurchaseOrderUploadExcel.uploadExcelForGeneratePurchaseOrderItemList({
      oid,
      userId: uid,
      file,
    })
  }
}
