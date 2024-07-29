import { Controller, Get } from '@nestjs/common'
import { Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiTicketProductService } from './api-ticket-product.service'
import { TicketProductPaginationQuery } from './request'

@ApiTags('TicketProduct')
@ApiBearerAuth('access-token')
@Controller('ticket-product')
export class ApiTicketProductController {
  constructor(private readonly apiTicketProductService: ApiTicketProductService) {}

  @Get('pagination')
  @HasPermission(PermissionId.PRODUCT_READ)
  async pagination(@External() { oid }: TExternal, @Query() query: TicketProductPaginationQuery) {
    return await this.apiTicketProductService.pagination(oid, query)
  }
}
