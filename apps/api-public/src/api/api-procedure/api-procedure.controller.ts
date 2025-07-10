import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiProcedureService } from './api-procedure.service'
import {
  ProcedureGetManyQuery,
  ProcedureGetOneQuery,
  ProcedurePaginationQuery,
  ProcedureUpsertBody,
} from './request'

@ApiTags('Procedure')
@ApiBearerAuth('access-token')
@Controller('procedure')
export class ApiProcedureController {
  constructor(private readonly apiProcedureService: ApiProcedureService) { }

  @Get('pagination')
  @OrganizationPermission(PermissionId.PROCEDURE)
  pagination(@External() { oid }: TExternal, @Query() query: ProcedurePaginationQuery) {
    return this.apiProcedureService.pagination(oid, query)
  }

  @Get('list')
  @OrganizationPermission(PermissionId.PROCEDURE)
  async list(@External() { oid }: TExternal, @Query() query: ProcedureGetManyQuery) {
    return await this.apiProcedureService.getMany(oid, query)
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.PROCEDURE)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: ProcedureGetOneQuery
  ) {
    return await this.apiProcedureService.getOne(oid, id, query)
  }

  @Post('create')
  @UserPermission(PermissionId.PROCEDURE_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: ProcedureUpsertBody) {
    return await this.apiProcedureService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.PROCEDURE_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ProcedureUpsertBody
  ) {
    return await this.apiProcedureService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.PROCEDURE_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiProcedureService.destroyOne(oid, id)
  }
}
