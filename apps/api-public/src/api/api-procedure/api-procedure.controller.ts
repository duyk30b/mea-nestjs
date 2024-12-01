import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiProcedureService } from './api-procedure.service'
import {
  ProcedureCreateBody,
  ProcedureGetManyQuery,
  ProcedureGetOneQuery,
  ProcedurePaginationQuery,
  ProcedureUpdateBody,
} from './request'

@ApiTags('Procedure')
@ApiBearerAuth('access-token')
@Controller('procedure')
export class ApiProcedureController {
  constructor(private readonly apiProcedureService: ApiProcedureService) { }

  @Get('pagination')
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: ProcedurePaginationQuery) {
    return this.apiProcedureService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  async list(@External() { oid }: TExternal, @Query() query: ProcedureGetManyQuery) {
    return await this.apiProcedureService.getMany(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: ProcedureGetOneQuery
  ) {
    return await this.apiProcedureService.getOne(oid, id, query)
  }

  @Post('create')
  @HasPermission(PermissionId.MASTER_DATA_PROCEDURE)
  async create(@External() { oid }: TExternal, @Body() body: ProcedureCreateBody) {
    return await this.apiProcedureService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.MASTER_DATA_PROCEDURE)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ProcedureUpdateBody
  ) {
    return await this.apiProcedureService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.MASTER_DATA_PROCEDURE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiProcedureService.destroyOne(oid, id)
  }
}
