import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
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
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: CustomerSourcePaginationQuery) {
    return this.apiCustomerSourceService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  list(@External() { oid }: TExternal, @Query() query: CustomerSourceGetManyQuery) {
    return this.apiCustomerSourceService.getMany(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiCustomerSourceService.getOne(oid, id)
  }

  @Post('create')
  @HasPermission(PermissionId.MASTER_DATA_TICKET_SOURCE)
  async createOne(@External() { oid }: TExternal, @Body() body: CustomerSourceCreateBody) {
    return await this.apiCustomerSourceService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.MASTER_DATA_TICKET_SOURCE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: CustomerSourceUpdateBody
  ) {
    return await this.apiCustomerSourceService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.MASTER_DATA_TICKET_SOURCE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiCustomerSourceService.destroyOne(oid, id)
  }
}
