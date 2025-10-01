import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { RegimenService } from './api-regimen.service'
import {
  RegimenGetManyQuery,
  RegimenGetOneQuery,
  RegimenPaginationQuery,
  RegimenUpsertWrapBody,
} from './request'

@ApiTags('Regimen')
@ApiBearerAuth('access-token')
@Controller('regimen')
export class RegimenController {
  constructor(private readonly regimenService: RegimenService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: RegimenPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.regimenService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: RegimenGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.regimenService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: RegimenGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.regimenService.getOne(oid, id, query)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_REGIMEN)
  async create(
    @External() { oid }: TExternal,
    @Body() body: RegimenUpsertWrapBody
  ): Promise<BaseResponse> {
    const data = await this.regimenService.createOne(oid, body)
    return { data }
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_REGIMEN)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RegimenUpsertWrapBody
  ): Promise<BaseResponse> {
    const data = await this.regimenService.updateOne(oid, id, body)
    return { data }
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_REGIMEN)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.regimenService.destroyOne(oid, id)
    return { data }
  }
}
