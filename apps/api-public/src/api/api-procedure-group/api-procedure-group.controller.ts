import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
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
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: ProcedureGroupPaginationQuery) {
    return this.apiProcedureGroupService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  list(@External() { oid }: TExternal, @Query() query: ProcedureGroupGetManyQuery) {
    return this.apiProcedureGroupService.getMany(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiProcedureGroupService.getOne(oid, id)
  }

  @Put('replace-all')
  @HasPermission(PermissionId.MASTER_DATA_PROCEDURE)
  async replaceAll(
    @External() { oid }: TExternal,
    @Body() body: ProcedureGroupReplaceAllBody
  ) {
    return await this.apiProcedureGroupService.replaceAll(oid, body)
  }

  @Post('create')
  @HasPermission(PermissionId.MASTER_DATA_PROCEDURE)
  async createOne(@External() { oid }: TExternal, @Body() body: ProcedureGroupCreateBody) {
    return await this.apiProcedureGroupService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.MASTER_DATA_PROCEDURE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ProcedureGroupUpdateBody
  ) {
    return await this.apiProcedureGroupService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.MASTER_DATA_PROCEDURE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiProcedureGroupService.destroyOne(oid, id)
  }
}
