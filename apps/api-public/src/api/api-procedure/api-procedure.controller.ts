import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
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
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: ProcedurePaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiProcedureService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @OrganizationPermission(PermissionId.PROCEDURE)
  async list(
    @External() { oid }: TExternal,
    @Query() query: ProcedureGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiProcedureService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.PROCEDURE)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: ProcedureGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiProcedureService.getOne(oid, id, query)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.PROCEDURE_CREATE)
  async create(
    @External() { oid }: TExternal,
    @Body() body: ProcedureUpsertBody
  ): Promise<BaseResponse> {
    const data = await this.apiProcedureService.createOne(oid, body)
    return { data }
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.PROCEDURE_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ProcedureUpsertBody
  ): Promise<BaseResponse> {
    const data = await this.apiProcedureService.updateOne(oid, id, body)
    return { data }
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.PROCEDURE_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.apiProcedureService.destroyOne(oid, id)
    return data
  }
}
