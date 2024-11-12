import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiParaclinicalGroupService } from './api-paraclinical-group.service'
import {
  ParaclinicalGroupCreateBody,
  ParaclinicalGroupGetManyQuery,
  ParaclinicalGroupPaginationQuery,
  ParaclinicalGroupUpdateBody,
} from './request'

@ApiTags('ParaclinicalGroup')
@ApiBearerAuth('access-token')
@Controller('paraclinical-group')
export class ApiParaclinicalGroupController {
  constructor(private readonly apiParaclinicalGroupService: ApiParaclinicalGroupService) { }

  @Get('pagination')
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: ParaclinicalGroupPaginationQuery) {
    return this.apiParaclinicalGroupService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  list(@External() { oid }: TExternal, @Query() query: ParaclinicalGroupGetManyQuery) {
    return this.apiParaclinicalGroupService.getMany(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiParaclinicalGroupService.getOne(oid, id)
  }

  @Post('create')
  @HasPermission(PermissionId.MASTER_DATA_PARACLINICAL_GROUP)
  async createOne(@External() { oid }: TExternal, @Body() body: ParaclinicalGroupCreateBody) {
    return await this.apiParaclinicalGroupService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.MASTER_DATA_PARACLINICAL_GROUP)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ParaclinicalGroupUpdateBody
  ) {
    return await this.apiParaclinicalGroupService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.MASTER_DATA_PARACLINICAL_GROUP)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiParaclinicalGroupService.destroyOne(oid, id)
  }
}
