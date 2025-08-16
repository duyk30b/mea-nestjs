import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiRegimenService } from './api-regimen.service'
import {
  RegimenCreateBody,
  RegimenGetManyQuery,
  RegimenGetOneQuery,
  RegimenPaginationQuery,
  RegimenUpdateBody,
} from './request'

@ApiTags('Regimen')
@ApiBearerAuth('access-token')
@Controller('regimen')
export class ApiRegimenController {
  constructor(private readonly apiRegimenService: ApiRegimenService) { }

  @Get('pagination')
  @OrganizationPermission(PermissionId.REGIMEN)
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: RegimenPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiRegimenService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @OrganizationPermission(PermissionId.REGIMEN)
  async list(
    @External() { oid }: TExternal,
    @Query() query: RegimenGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiRegimenService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.REGIMEN)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: RegimenGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiRegimenService.getOne(oid, id, query)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.REGIMEN_CREATE)
  async create(
    @External() { oid }: TExternal,
    @Body() body: RegimenCreateBody
  ): Promise<BaseResponse> {
    const data = await this.apiRegimenService.createOne(oid, body)
    return { data }
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.REGIMEN_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RegimenUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiRegimenService.updateOne(oid, id, body)
    return { data }
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.REGIMEN_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    return await this.apiRegimenService.destroyOne(oid, id)
  }
}
