import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { RadiologyService } from './radiology.service'
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
export class RadiologyController {
  constructor(private readonly radiologyService: RadiologyService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: RadiologyPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.radiologyService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: RadiologyGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.radiologyService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: RadiologyGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.radiologyService.getOne(oid, id, query)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_RADIOLOGY)
  async create(
    @External() { oid }: TExternal,
    @Body() body: RadiologyUpsertBody
  ): Promise<BaseResponse> {
    const data = await this.radiologyService.createOne(oid, body)
    return { data }
  }

  @Post('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_RADIOLOGY)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RadiologyUpsertBody
  ): Promise<BaseResponse> {
    const data = await this.radiologyService.updateOne(oid, id, body)
    return { data }
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_RADIOLOGY)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.radiologyService.destroyOne(oid, id)
    return { data }
  }

  @Get('system-list')
  @UserPermission()
  async systemList(): Promise<BaseResponse> {
    const data = await this.radiologyService.systemList()
    return { data }
  }

  @Post('system-copy')
  @UserPermission(PermissionId.MASTER_DATA_RADIOLOGY)
  async systemCopy(
    @External() { oid }: TExternal,
    @Body() body: RadiologySystemCopyBody
  ): Promise<BaseResponse> {
    const data = await this.radiologyService.systemCopy(oid, body)
    return { data }
  }
}
