import { Controller, Get } from '@nestjs/common'
import { Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
import { ApiInvoiceItemService } from './api-invoice-item.service'
import { InvoiceItemPaginationQuery } from './request'

@ApiTags('InvoiceItem')
@ApiBearerAuth('access-token')
@Controller('invoice-item')
export class ApiInvoiceItemController {
  constructor(private readonly apiInvoiceItemService: ApiInvoiceItemService) {}

  @Get('pagination')
  @HasPermission(PermissionId.INVOICE_READ)
  async pagination(@External() { oid }: TExternal, @Query() query: InvoiceItemPaginationQuery) {
    return await this.apiInvoiceItemService.pagination(oid, query)
  }
}
