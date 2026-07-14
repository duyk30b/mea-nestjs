import { IdParam } from '@libs/common/dto/param'
import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { CustomerSourceService } from './customer_source.service'
import {
    CustomerSourceCreateBody,
    CustomerSourceGetManyQuery,
    CustomerSourcePaginationQuery,
    CustomerSourceUpdateBody,
} from './request'

@ApiTags('CustomerSource')
@ApiBearerAuth('access-token')
@Controller('customer_source')
export class CustomerSourceController {
  constructor(private readonly customerSourceService: CustomerSourceService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: CustomerSourcePaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.customerSourceService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(@External() { oid }: TExternal, @Query() query: CustomerSourceGetManyQuery): Promise<BaseResponse> {
    const data = await this.customerSourceService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async findOne(@External() { oid }: TExternal, @Param() { id }: IdParam): Promise<BaseResponse> {
    const data = await this.customerSourceService.getOne(oid, id)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_CUSTOMER_SOURCE)
  async createOne(@External() { oid }: TExternal, @Body() body: CustomerSourceCreateBody): Promise<BaseResponse> {
    const data = await this.customerSourceService.createOne(oid, body)
    return { data }
  }

  @Post('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_CUSTOMER_SOURCE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: CustomerSourceUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.customerSourceService.updateOne(oid, id, body)
    return { data }
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_CUSTOMER_SOURCE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam): Promise<BaseResponse> {
    const data = await this.customerSourceService.destroyOne(oid, id)
    return { data }
  }
}
