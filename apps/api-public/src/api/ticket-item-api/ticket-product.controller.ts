import {
  TicketProductGetManyQuery,
  TicketProductPaginationQuery,
} from '@api-public/resource/ticket-product/ticket-product-get.query'
import { TicketProductResource } from '@api-public/resource/ticket-product/ticket-product.resource'
import { GenerateIdParam } from '@libs/common/dto'
import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { TicketProductService } from './ticket-product.service'

@ApiTags('TicketProduct')
@ApiBearerAuth('access-token')
@Controller('ticket-product')
export class TicketProductController {
  constructor(
    private readonly ticketProductResource: TicketProductResource,
    private readonly ticketProductService: TicketProductService
  ) {}

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TicketProductPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.ticketProductResource.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: TicketProductGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.ticketProductResource.getList(oid, query)
    return { data }
  }

  @Post('destroy-zero/:id')
  @UserPermission()
  async destroyZero(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
    const data = await this.ticketProductService.destroyZero(oid, id)
    return { data }
  }
}
