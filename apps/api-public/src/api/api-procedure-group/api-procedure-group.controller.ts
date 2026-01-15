import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiProcedureGroupService } from './api-procedure-group.service'
import {
  ProcedureGroupCreateBody,
  ProcedureGroupGetManyQuery,
  ProcedureGroupPaginationQuery,
  ProcedureGroupReplaceAllBody,
  ProcedureGroupUpdateBody,
} from './request'

@ApiTags('ProcedureGroup')
@ApiBearerAuth('access-token')
@Controller('procedure-group')
export class ApiProcedureGroupController {
  constructor(private readonly apiProcedureGroupService: ApiProcedureGroupService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: ProcedureGroupPaginationQuery
  ): Promise<BaseResponse> {
    const data = this.apiProcedureGroupService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: ProcedureGroupGetManyQuery) {
    return this.apiProcedureGroupService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiProcedureGroupService.getOne(oid, id)
  }

  @Post('replace-all')
  @UserPermission(PermissionId.MASTER_DATA_PROCEDURE)
  async replaceAll(@External() { oid }: TExternal, @Body() body: ProcedureGroupReplaceAllBody) {
    return await this.apiProcedureGroupService.replaceAll(oid, body)
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_PROCEDURE)
  async createOne(@External() { oid }: TExternal, @Body() body: ProcedureGroupCreateBody) {
    return await this.apiProcedureGroupService.createOne(oid, body)
  }

  @Post('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_PROCEDURE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ProcedureGroupUpdateBody
  ) {
    return await this.apiProcedureGroupService.updateOne(oid, id, body)
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_PROCEDURE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiProcedureGroupService.destroyOne(oid, id)
  }
}
