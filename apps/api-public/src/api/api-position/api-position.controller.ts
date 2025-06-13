import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiPositionService } from './api-position.service'
import {
  PositionCreateBody,
  PositionGetManyQuery,
  PositionGetOneQuery,
  PositionPaginationQuery,
  PositionReplaceListBody,
  PositionUpdateBody,
} from './request'

@ApiTags('Position')
@ApiBearerAuth('access-token')
@Controller('position')
export class ApiPositionController {
  constructor(private readonly apiPositionService: ApiPositionService) { }

  @Get('pagination')
  @OrganizationPermission()
  pagination(
    @External(PermissionId.POSITION) { oid }: TExternal,
    @Query() query: PositionPaginationQuery
  ) {
    return this.apiPositionService.pagination(oid, query)
  }

  @Get('list')
  @OrganizationPermission(PermissionId.POSITION)
  list(@External() { oid }: TExternal, @Query() query: PositionGetManyQuery) {
    return this.apiPositionService.getMany(oid, query)
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.POSITION)
  findOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: PositionGetOneQuery
  ) {
    return this.apiPositionService.getOne(oid, id, query)
  }

  @Post('create')
  @UserPermission(PermissionId.POSITION_CREATE)
  async createOne(@External() { oid }: TExternal, @Body() body: PositionCreateBody) {
    return await this.apiPositionService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.POSITION_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: PositionUpdateBody
  ) {
    return await this.apiPositionService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.POSITION_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiPositionService.destroyOne(oid, id)
  }

  @Put('replace-list')
  @UserPermission(PermissionId.POSITION_UPDATE)
  async replaceAll(@External() { oid }: TExternal, @Body() body: PositionReplaceListBody) {
    return await this.apiPositionService.replaceList(oid, body)
  }
}
