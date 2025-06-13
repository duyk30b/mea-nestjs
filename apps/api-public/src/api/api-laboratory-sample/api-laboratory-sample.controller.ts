import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
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
  @OrganizationPermission(PermissionId.LABORATORY)
  pagination(@External() { oid }: TExternal, @Query() query: LaboratorySamplePaginationQuery) {
    return this.apiLaboratorySampleService.pagination(oid, query)
  }

  @Get('list')
  @OrganizationPermission(PermissionId.LABORATORY)
  list(@External() { oid }: TExternal, @Query() query: LaboratorySampleGetManyQuery) {
    return this.apiLaboratorySampleService.getMany(oid, query)
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.LABORATORY)
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiLaboratorySampleService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.LABORATORY_SAMPLE_CRUD)
  async createOne(@External() { oid }: TExternal, @Body() body: LaboratorySampleCreateBody) {
    return await this.apiLaboratorySampleService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.LABORATORY_SAMPLE_CRUD)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: LaboratorySampleUpdateBody
  ) {
    return await this.apiLaboratorySampleService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.LABORATORY_SAMPLE_CRUD)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiLaboratorySampleService.destroyOne(oid, id)
  }
}
