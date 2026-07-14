import { IdParam } from '@libs/common/dto/param'
import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { CustomerService } from './customer.service'
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
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: CustomerPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.customerService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: CustomerGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.customerService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: CustomerGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.customerService.getOne(oid, id, query)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.CUSTOMER_CRUD)
  async create(
    @External() { oid }: TExternal,
    @Body() body: CustomerCreateBody
  ): Promise<BaseResponse> {
    const data = await this.customerService.createOne(oid, body)
    return { data }
  }

  @Post('update/:id')
  @UserPermission(PermissionId.CUSTOMER_CRUD)
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: CustomerUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.customerService.updateOne(oid, +id, body)
    return { data }
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.CUSTOMER_CRUD)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid, organization }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.customerService.destroyOne({
      oid,
      customerId: id,
    })
    return { data }
  }
}
