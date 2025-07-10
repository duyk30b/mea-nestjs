import { Controller, Delete, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiTicketProductService } from './api-ticket-product.service'
import { TicketProductGetManyQuery, TicketProductPaginationQuery } from './request'

@ApiTags('TicketProduct')
@ApiBearerAuth('access-token')
@Controller('ticket-product')
export class ApiTicketProductController {
  constructor(private readonly apiTicketProductService: ApiTicketProductService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(@External() { oid }: TExternal, @Query() query: TicketProductPaginationQuery) {
    return await this.apiTicketProductService.pagination(oid, query)
  }

  @Get('list')
  @UserPermission()
  async list(@External() { oid }: TExternal, @Query() query: TicketProductGetManyQuery) {
    return await this.apiTicketProductService.getList(oid, query)
  }

  @Delete('destroy-zero/:id')
  @UserPermission()
  async destroyZero(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketProductService.destroyZero(oid, id)
  }
}
