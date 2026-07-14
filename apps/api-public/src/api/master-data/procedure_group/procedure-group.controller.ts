import { IdParam } from '@libs/common/dto/param'
import { UserPermission } from '@libs/common/guards/user.guard'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { ProcedureGroupService } from './procedure-group.service'
import {
    ProcedureGroupCreateBody,
    ProcedureGroupGetManyQuery,
    ProcedureGroupReplaceAllBody,
    ProcedureGroupUpdateBody,
} from './request'

@ApiTags('ProcedureGroup')
@ApiBearerAuth('access-token')
@Controller('procedure-group')
export class ProcedureGroupController {
  constructor(private readonly procedureGroupService: ProcedureGroupService) { }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: ProcedureGroupGetManyQuery) {
    return this.procedureGroupService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.procedureGroupService.getOne(oid, id)
  }

  @Post('replace-all')
  @UserPermission(PermissionId.MASTER_DATA_PROCEDURE)
  async replaceAll(@External() { oid }: TExternal, @Body() body: ProcedureGroupReplaceAllBody) {
    return await this.procedureGroupService.replaceAll(oid, body)
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_PROCEDURE)
  async createOne(@External() { oid }: TExternal, @Body() body: ProcedureGroupCreateBody) {
    return await this.procedureGroupService.createOne(oid, body)
  }

  @Post('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_PROCEDURE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ProcedureGroupUpdateBody
  ) {
    return await this.procedureGroupService.updateOne(oid, id, body)
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_PROCEDURE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.procedureGroupService.destroyOne(oid, id)
  }
}
