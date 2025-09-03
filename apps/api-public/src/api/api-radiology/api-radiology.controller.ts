import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiRadiologyService } from './api-radiology.service'
import {
  RadiologyGetManyQuery,
  RadiologyGetOneQuery,
  RadiologyPaginationQuery,
  RadiologySystemCopyBody,
  RadiologyUpsertBody,
} from './request'

@ApiTags('Radiology')
@ApiBearerAuth('access-token')
@Controller('radiology')
export class ApiRadiologyController {
  constructor(private readonly apiRadiologyService: ApiRadiologyService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: RadiologyPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiRadiologyService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: RadiologyGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiRadiologyService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: RadiologyGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiRadiologyService.getOne(oid, id, query)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.RADIOLOGY_CREATE)
  async create(
    @External() { oid }: TExternal,
    @Body() body: RadiologyUpsertBody
  ): Promise<BaseResponse> {
    const data = await this.apiRadiologyService.createOne(oid, body)
    return { data }
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.RADIOLOGY_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RadiologyUpsertBody
  ): Promise<BaseResponse> {
    const data = await this.apiRadiologyService.updateOne(oid, id, body)
    return { data }
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.RADIOLOGY_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.apiRadiologyService.destroyOne(oid, id)
    return { data }
  }

  @Get('system-list')
  @UserPermission()
  async systemList(): Promise<BaseResponse> {
    const data = await this.apiRadiologyService.systemList()
    return { data }
  }

  @Post('system-copy')
  @UserPermission(PermissionId.RADIOLOGY_CREATE)
  async systemCopy(
    @External() { oid }: TExternal,
    @Body() body: RadiologySystemCopyBody
  ): Promise<BaseResponse> {
    const data = await this.apiRadiologyService.systemCopy(oid, body)
    return { data }
  }
}
