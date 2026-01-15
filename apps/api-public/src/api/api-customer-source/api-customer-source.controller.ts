import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiCustomerSourceService } from './api-customer-source.service'
import {
  CustomerSourceCreateBody,
  CustomerSourceGetManyQuery,
  CustomerSourcePaginationQuery,
  CustomerSourceUpdateBody,
} from './request'

@ApiTags('CustomerSource')
@ApiBearerAuth('access-token')
@Controller('customer-source')
export class ApiCustomerSourceController {
  constructor(private readonly apiCustomerSourceService: ApiCustomerSourceService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: CustomerSourcePaginationQuery
  ): Promise<BaseResponse> {
    const data = this.apiCustomerSourceService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: CustomerSourceGetManyQuery) {
    return this.apiCustomerSourceService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiCustomerSourceService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_CUSTOMER_SOURCE)
  async createOne(@External() { oid }: TExternal, @Body() body: CustomerSourceCreateBody) {
    return await this.apiCustomerSourceService.createOne(oid, body)
  }

  @Post('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_CUSTOMER_SOURCE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: CustomerSourceUpdateBody
  ) {
    return await this.apiCustomerSourceService.updateOne(oid, id, body)
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_CUSTOMER_SOURCE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiCustomerSourceService.destroyOne(oid, id)
  }
}
