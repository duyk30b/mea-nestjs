import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiDistributorService } from './api-distributor.service'
import {
  DistributorCreateBody,
  DistributorGetManyQuery,
  DistributorPaginationQuery,
  DistributorUpdateBody,
} from './request'

@ApiTags('Distributor')
@ApiBearerAuth('access-token')
@Controller('distributor')
export class ApiDistributorController {
  constructor(private readonly apiDistributorService: ApiDistributorService) { }

  @Get('pagination')
  @OrganizationPermission(PermissionId.DISTRIBUTOR)
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: DistributorPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiDistributorService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @OrganizationPermission(PermissionId.DISTRIBUTOR)
  async list(
    @External() { oid }: TExternal,
    @Query() query: DistributorGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiDistributorService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.DISTRIBUTOR)
  async findOne(@External() { oid }: TExternal, @Param() { id }: IdParam): Promise<BaseResponse> {
    const data = await this.apiDistributorService.getOne(oid, id)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.DISTRIBUTOR_CREATE)
  async createOne(
    @External() { oid }: TExternal,
    @Body() body: DistributorCreateBody
  ): Promise<BaseResponse> {
    const data = await this.apiDistributorService.createOne(oid, body)
    return { data }
  }

  @Post('update/:id')
  @UserPermission(PermissionId.DISTRIBUTOR_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: DistributorUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiDistributorService.updateOne(oid, id, body)
    return { data }
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.DISTRIBUTOR_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.apiDistributorService.destroyOne(oid, id)
    return { data }
  }
}
