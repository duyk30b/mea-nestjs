import { Controller, Get } from '@nestjs/common'
import { Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiReceiptItemService } from './api-receipt-item.service'
import { ReceiptItemPaginationQuery } from './request'

@ApiTags('ReceiptItem')
@ApiBearerAuth('access-token')
@Controller('receipt-item')
export class ApiReceiptItemController {
  constructor(private readonly apiReceiptItemService: ApiReceiptItemService) { }

  @Get('pagination')
  @OrganizationPermission(PermissionId.RECEIPT)
  async pagination(@External() { oid }: TExternal, @Query() query: ReceiptItemPaginationQuery) {
    return await this.apiReceiptItemService.pagination(oid, query)
  }
}
