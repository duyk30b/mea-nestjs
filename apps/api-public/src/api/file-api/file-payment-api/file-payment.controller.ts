import { PaymentGetManyQuery } from '@api-public/resource/payment-resource/payment.query'
import { UserPermission } from '@libs/common/guards/user.guard'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { FilePaymentDownloadExcel } from './file-payment.download-excel'

@ApiTags('FilePayment')
@ApiBearerAuth('access-token')
@Controller('file-payment')
export class FilePaymentController {
  constructor(private readonly filePaymentDownloadExcel: FilePaymentDownloadExcel) {}

  @Get('download-excel')
  @UserPermission(PermissionId.FILE_EXCEL_DOWNLOAD_PAYMENT)
  async downloadExcel(
    @External() { oid, user, organization }: TExternal,
    @Query() query: PaymentGetManyQuery
  ) {
    return await this.filePaymentDownloadExcel.downloadExcel({ organization, user, query })
  }
}
