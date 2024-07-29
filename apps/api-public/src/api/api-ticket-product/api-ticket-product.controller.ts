import { Controller, Delete, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiTicketProductService } from './api-ticket-product.service'
import { TicketProductPaginationQuery } from './request'

@ApiTags('TicketProduct')
@ApiBearerAuth('access-token')
@Controller('ticket-product')
export class ApiTicketProductController {
  constructor(private readonly apiTicketProductService: ApiTicketProductService) { }

  @Get('pagination')
  @HasPermission(PermissionId.PRODUCT_READ)
  async pagination(@External() { oid }: TExternal, @Query() query: TicketProductPaginationQuery) {
    return await this.apiTicketProductService.pagination(oid, query)
  }

  @Delete('destroy-zero/:id')
  @IsUser()
  async destroyZero(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketProductService.destroyZero(oid, id)
  }
}
