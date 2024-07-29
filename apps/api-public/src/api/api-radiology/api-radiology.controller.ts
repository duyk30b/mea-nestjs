import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiRadiologyService } from './api-radiology.service'
import {
  RadiologyCreateBody,
  RadiologyGetManyQuery,
  RadiologyPaginationQuery,
  RadiologyUpdateBody,
} from './request'

@ApiTags('Radiology')
@ApiBearerAuth('access-token')
@Controller('radiology')
export class ApiRadiologyController {
  constructor(private readonly apiRadiologyService: ApiRadiologyService) { }

  @Get('pagination')
  @HasPermission(PermissionId.RADIOLOGY_READ)
  pagination(@External() { oid }: TExternal, @Query() query: RadiologyPaginationQuery) {
    return this.apiRadiologyService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.RADIOLOGY_READ)
  async list(@External() { oid }: TExternal, @Query() query: RadiologyGetManyQuery) {
    return await this.apiRadiologyService.getMany(oid, query)
  }

  @Get('example-list')
  @HasPermission(PermissionId.RADIOLOGY_READ)
  async exampleList() {
    return await this.apiRadiologyService.exampleList()
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.RADIOLOGY_READ)
  async detail(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiRadiologyService.getOne(oid, id)
  }

  @Post('create')
  @HasPermission(PermissionId.RADIOLOGY_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: RadiologyCreateBody) {
    return await this.apiRadiologyService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.RADIOLOGY_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RadiologyUpdateBody
  ) {
    return await this.apiRadiologyService.updateOne(oid, id, body)
  }

  @Delete('delete/:id')
  @HasPermission(PermissionId.RADIOLOGY_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiRadiologyService.deleteOne(oid, id)
  }
}
