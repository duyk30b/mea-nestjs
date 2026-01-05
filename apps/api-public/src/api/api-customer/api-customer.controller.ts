import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiCustomerService } from './api-customer.service'
import {
  CustomerCreateBody,
  CustomerGetManyQuery,
  CustomerGetOneQuery,
  CustomerPaginationQuery,
  CustomerUpdateBody,
} from './request'

@ApiTags('Customer')
@ApiBearerAuth('access-token')
@Controller('customer')
export class ApiCustomerController {
  constructor(private readonly apiCustomerService: ApiCustomerService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: CustomerPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiCustomerService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: CustomerGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiCustomerService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: CustomerGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiCustomerService.getOne(oid, id, query)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.CUSTOMER_CREATE)
  async create(
    @External() { oid }: TExternal,
    @Body() body: CustomerCreateBody
  ): Promise<BaseResponse> {
    const data = await this.apiCustomerService.createOne(oid, body)
    return { data }
  }

  @Post('update/:id')
  @UserPermission(PermissionId.CUSTOMER_UPDATE)
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: CustomerUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiCustomerService.updateOne(oid, +id, body)
    return { data }
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.CUSTOMER_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid, organization }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.apiCustomerService.destroyOne({
      oid,
      customerId: id,
    })
    return { data }
  }
}
