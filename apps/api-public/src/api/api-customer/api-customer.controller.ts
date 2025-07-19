import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
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
  constructor(
    private readonly apiCustomerService: ApiCustomerService
  ) { }

  @Get('pagination')
  @UserPermission()
  pagination(@External() { oid }: TExternal, @Query() query: CustomerPaginationQuery) {
    return this.apiCustomerService.pagination(oid, query)
  }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: CustomerGetManyQuery) {
    return this.apiCustomerService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: CustomerGetOneQuery
  ) {
    return await this.apiCustomerService.getOne(oid, id, query)
  }

  @Post('create')
  @UserPermission(PermissionId.CUSTOMER_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: CustomerCreateBody) {
    return await this.apiCustomerService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.CUSTOMER_UPDATE)
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: CustomerUpdateBody
  ) {
    return await this.apiCustomerService.updateOne(oid, +id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.CUSTOMER_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid, organization }: TExternal, @Param() { id }: IdParam) {
    return await this.apiCustomerService.destroyOne({
      oid,
      customerId: id,
    })
  }
}
