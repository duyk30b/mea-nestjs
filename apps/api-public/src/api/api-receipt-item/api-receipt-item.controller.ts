import { Controller, Get } from '@nestjs/common'
import { Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiReceiptItemService } from './api-receipt-item.service'
import { ReceiptItemPaginationQuery } from './request'

@ApiTags('ReceiptItem')
@ApiBearerAuth('access-token')
@Controller('receipt-item')
export class ApiReceiptItemController {
  constructor(private readonly apiReceiptItemService: ApiReceiptItemService) {}

  @Get('pagination')
  @HasPermission(PermissionId.RECEIPT_READ)
  async pagination(@External() { oid }: TExternal, @Query() query: ReceiptItemPaginationQuery) {
    return await this.apiReceiptItemService.pagination(oid, query)
  }
}
