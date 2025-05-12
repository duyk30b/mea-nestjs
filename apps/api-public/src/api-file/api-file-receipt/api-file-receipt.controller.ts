import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileUploadDto, SingleFileUpload } from '../../../../_libs/common/dto/file'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { FastifyFileInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiFileReceiptUploadExcel } from './api-file-receipt.upload-excel'

@ApiTags('FileProduct')
@ApiBearerAuth('access-token')
@Controller('file-receipt')
export class ApiFileReceiptController {
  constructor(private readonly apiFileReceiptUploadExcel: ApiFileReceiptUploadExcel) { }

  @Get('upload-excel/file-example')
  @HasPermission(PermissionId.FILE_RECEIPT_UPLOAD_EXCEL)
  async uploadExcelFileExample(@External() { user, organization }: TExternal) {
    return await this.apiFileReceiptUploadExcel.fileExample()
  }

  @Post('upload-excel-for-create-draft')
  @HasPermission(PermissionId.FILE_RECEIPT_UPLOAD_EXCEL)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('file', {}))
  async uploadExcelForCreateDraft(
    @External() { user, oid }: TExternal,
    @UploadedFile() file: FileUploadDto,
    @Body() body: SingleFileUpload
  ) {
    return await this.apiFileReceiptUploadExcel.uploadExcelForCreateDraft({ oid, user, file })
  }
}
