import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiLaboratoryGroupService } from './api-laboratory-group.service'
import {
  LaboratoryGroupCreateBody,
  LaboratoryGroupGetManyQuery,
  LaboratoryGroupPaginationQuery,
  LaboratoryGroupReplaceAllBody,
  LaboratoryGroupUpdateBody,
} from './request'

@ApiTags('LaboratoryGroup')
@ApiBearerAuth('access-token')
@Controller('laboratory-group')
export class ApiLaboratoryGroupController {
  constructor(private readonly apiLaboratoryGroupService: ApiLaboratoryGroupService) { }

  @Get('pagination')
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: LaboratoryGroupPaginationQuery) {
    return this.apiLaboratoryGroupService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  list(@External() { oid }: TExternal, @Query() query: LaboratoryGroupGetManyQuery) {
    return this.apiLaboratoryGroupService.getMany(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiLaboratoryGroupService.getOne(oid, id)
  }

  @Post('create')
  @HasPermission(PermissionId.MASTER_DATA_LABORATORY)
  async createOne(@External() { oid }: TExternal, @Body() body: LaboratoryGroupCreateBody) {
    return await this.apiLaboratoryGroupService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.MASTER_DATA_LABORATORY)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: LaboratoryGroupUpdateBody
  ) {
    return await this.apiLaboratoryGroupService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.MASTER_DATA_LABORATORY)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiLaboratoryGroupService.destroyOne(oid, id)
  }

  @Put('replace-all')
  @HasPermission(PermissionId.MASTER_DATA_LABORATORY)
  async replaceAll(
    @External() { oid }: TExternal,
    @Body() body: LaboratoryGroupReplaceAllBody
  ) {
    return await this.apiLaboratoryGroupService.replaceAll(oid, body)
  }

  @Get('system-list')
  @IsUser()
  async systemList() {
    return await this.apiLaboratoryGroupService.systemList()
  }
}
