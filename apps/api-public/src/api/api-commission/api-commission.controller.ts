import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiCommissionService } from './api-commission.service'
import {
  CommissionCreateBody,
  CommissionGetManyQuery,
  CommissionGetOneQuery,
  CommissionPaginationQuery,
  CommissionReplaceListBody,
  CommissionUpdateBody,
} from './request'

@ApiTags('Commission')
@ApiBearerAuth('access-token')
@Controller('commission')
export class ApiCommissionController {
  constructor(private readonly apiCommissionService: ApiCommissionService) { }

  @Get('pagination')
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: CommissionPaginationQuery) {
    return this.apiCommissionService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  list(@External() { oid }: TExternal, @Query() query: CommissionGetManyQuery) {
    return this.apiCommissionService.getMany(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  findOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: CommissionGetOneQuery
  ) {
    return this.apiCommissionService.getOne(oid, id, query)
  }

  @Post('create')
  @HasPermission(PermissionId.COMMISSION_CRUD)
  async createOne(@External() { oid }: TExternal, @Body() body: CommissionCreateBody) {
    return await this.apiCommissionService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.COMMISSION_CRUD)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: CommissionUpdateBody
  ) {
    return await this.apiCommissionService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.COMMISSION_CRUD)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiCommissionService.destroyOne(oid, id)
  }

  @Put('replace-list')
  @HasPermission(PermissionId.COMMISSION_CRUD)
  async replaceAll(@External() { oid }: TExternal, @Body() body: CommissionReplaceListBody) {
    return await this.apiCommissionService.replaceList(oid, body)
  }
}
