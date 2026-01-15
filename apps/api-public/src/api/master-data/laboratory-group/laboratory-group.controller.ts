import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { LaboratoryGroupService } from './laboratory-group.service'
import {
  LaboratoryGroupGetManyQuery,
  LaboratoryGroupPaginationQuery,
  LaboratoryGroupReplaceAllBody,
  LaboratoryGroupUpsertBody,
} from './request'

@ApiTags('LaboratoryGroup')
@ApiBearerAuth('access-token')
@Controller('laboratory-group')
export class LaboratoryGroupController {
  constructor(private readonly laboratoryGroupService: LaboratoryGroupService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: LaboratoryGroupPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.laboratoryGroupService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: LaboratoryGroupGetManyQuery) {
    return this.laboratoryGroupService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.laboratoryGroupService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY)
  async createOne(@External() { oid }: TExternal, @Body() body: LaboratoryGroupUpsertBody) {
    return await this.laboratoryGroupService.createOne(oid, body)
  }

  @Post('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: LaboratoryGroupUpsertBody
  ) {
    return await this.laboratoryGroupService.updateOne(oid, id, body)
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.laboratoryGroupService.destroyOne(oid, id)
  }

  @Post('replace-all')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY)
  async replaceAll(@External() { oid }: TExternal, @Body() body: LaboratoryGroupReplaceAllBody) {
    return await this.laboratoryGroupService.replaceAll(oid, body)
  }

  @Get('system-list')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY)
  async systemList() {
    return await this.laboratoryGroupService.systemList()
  }
}
