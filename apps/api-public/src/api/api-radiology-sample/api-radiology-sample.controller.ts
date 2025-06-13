import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiRadiologySampleService } from './api-radiology-sample.service'
import {
  RadiologySampleCreateBody,
  RadiologySampleGetManyQuery,
  RadiologySamplePaginationQuery,
  RadiologySampleUpdateBody,
} from './request'

@ApiTags('RadiologySample')
@ApiBearerAuth('access-token')
@Controller('radiology-sample')
export class ApiRadiologySampleController {
  constructor(private readonly apiRadiologySampleService: ApiRadiologySampleService) { }

  @Get('pagination')
  @UserPermission()
  pagination(@External() { oid }: TExternal, @Query() query: RadiologySamplePaginationQuery) {
    return this.apiRadiologySampleService.pagination(oid, query)
  }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: RadiologySampleGetManyQuery) {
    return this.apiRadiologySampleService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiRadiologySampleService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.RADIOLOGY_SAMPLE_CRUD)
  async createOne(@External() { oid }: TExternal, @Body() body: RadiologySampleCreateBody) {
    return await this.apiRadiologySampleService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.RADIOLOGY_SAMPLE_CRUD)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RadiologySampleUpdateBody
  ) {
    return await this.apiRadiologySampleService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.RADIOLOGY_SAMPLE_CRUD)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiRadiologySampleService.destroyOne(oid, id)
  }
}
