import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiCustomerExcel } from './api-customer.excel'
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
    private readonly apiCustomerService: ApiCustomerService,
    private readonly apiCustomerExcel: ApiCustomerExcel
  ) { }

  @Get('pagination')
  @HasPermission(PermissionId.CUSTOMER_READ)
  pagination(@External() { oid }: TExternal, @Query() query: CustomerPaginationQuery) {
    return this.apiCustomerService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.CUSTOMER_READ)
  list(@External() { oid }: TExternal, @Query() query: CustomerGetManyQuery) {
    return this.apiCustomerService.getMany(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.CUSTOMER_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: CustomerGetOneQuery
  ) {
    return await this.apiCustomerService.getOne(oid, id, query)
  }

  @Post('create')
  @HasPermission(PermissionId.CUSTOMER_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: CustomerCreateBody) {
    return await this.apiCustomerService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.CUSTOMER_UPDATE)
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: CustomerUpdateBody
  ) {
    return await this.apiCustomerService.updateOne(oid, +id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.CUSTOMER_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid, organization }: TExternal, @Param() { id }: IdParam) {
    return await this.apiCustomerService.destroyOne({
      oid,
      customerId: id,
      organization,
    })
  }

  @Get('download-excel')
  @HasPermission(PermissionId.PRODUCT_DOWNLOAD_EXCEL)
  async downloadExcel(@External() { user, organization }: TExternal) {
    return await this.apiCustomerExcel.downloadExcel({ organization, user })
  }
}
