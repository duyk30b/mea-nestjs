import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
import { ApiProcedureService } from './api-procedure.service'
import {
  ProcedureCreateBody,
  ProcedureGetManyQuery,
  ProcedurePaginationQuery,
  ProcedureUpdateBody,
} from './request'

@ApiTags('Procedure')
@ApiBearerAuth('access-token')
@Controller('procedure')
export class ApiProcedureController {
  constructor(private readonly apiProcedureService: ApiProcedureService) {}

  @Get('pagination')
  @HasPermission(PermissionId.PROCEDURE_READ)
  pagination(@External() { oid }: TExternal, @Query() query: ProcedurePaginationQuery) {
    return this.apiProcedureService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.PROCEDURE_READ)
  async list(@External() { oid }: TExternal, @Query() query: ProcedureGetManyQuery) {
    return await this.apiProcedureService.getMany(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.PROCEDURE_READ)
  async detail(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiProcedureService.getOne(oid, id)
  }

  @Post('create')
  @HasPermission(PermissionId.PROCEDURE_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: ProcedureCreateBody) {
    return await this.apiProcedureService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.PROCEDURE_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ProcedureUpdateBody
  ) {
    return await this.apiProcedureService.updateOne(oid, id, body)
  }

  @Delete('delete/:id')
  @HasPermission(PermissionId.PROCEDURE_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiProcedureService.deleteOne(oid, id)
  }
}
