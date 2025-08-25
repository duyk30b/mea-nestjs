import { Controller, Delete, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
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
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TicketProductPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiTicketProductService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: TicketProductGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiTicketProductService.getList(oid, query)
    return { data }
  }

  @Delete('destroy-zero/:id')
  @UserPermission()
  async destroyZero(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.apiTicketProductService.destroyZero(oid, id)
    return { data }
  }
}
