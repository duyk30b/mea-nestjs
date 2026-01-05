import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiLaboratorySampleService } from './api-laboratory-sample.service'
import {
  LaboratorySampleCreateBody,
  LaboratorySampleGetManyQuery,
  LaboratorySamplePaginationQuery,
  LaboratorySampleUpdateBody,
} from './request'

@ApiTags('LaboratorySample')
@ApiBearerAuth('access-token')
@Controller('laboratory-sample')
export class ApiLaboratorySampleController {
  constructor(private readonly apiLaboratorySampleService: ApiLaboratorySampleService) { }

  @Get('pagination')
  @UserPermission()
  pagination(@External() { oid }: TExternal, @Query() query: LaboratorySamplePaginationQuery) {
    return this.apiLaboratorySampleService.pagination(oid, query)
  }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: LaboratorySampleGetManyQuery) {
    return this.apiLaboratorySampleService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiLaboratorySampleService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY_SAMPLE)
  async createOne(@External() { oid }: TExternal, @Body() body: LaboratorySampleCreateBody) {
    return await this.apiLaboratorySampleService.createOne(oid, body)
  }

  @Post('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY_SAMPLE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: LaboratorySampleUpdateBody
  ) {
    return await this.apiLaboratorySampleService.updateOne(oid, id, body)
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY_SAMPLE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiLaboratorySampleService.destroyOne(oid, id)
  }
}
