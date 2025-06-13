import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiLaboratoryService } from './api-laboratory.service'
import {
  LaboratoryCreateBody,
  LaboratoryGetManyQuery,
  LaboratoryGetOneQuery,
  LaboratoryPaginationQuery,
  LaboratorySystemCopyBody,
  LaboratoryUpdateBody,
} from './request'

@ApiTags('Laboratory')
@ApiBearerAuth('access-token')
@Controller('laboratory')
export class ApiLaboratoryController {
  constructor(private readonly apiLaboratoryService: ApiLaboratoryService) { }

  @Get('pagination')
  @OrganizationPermission(PermissionId.LABORATORY)
  pagination(@External() { oid }: TExternal, @Query() query: LaboratoryPaginationQuery) {
    return this.apiLaboratoryService.pagination(oid, query)
  }

  @Get('list')
  @OrganizationPermission(PermissionId.LABORATORY)
  async list(@External() { oid }: TExternal, @Query() query: LaboratoryGetManyQuery) {
    return await this.apiLaboratoryService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission(PermissionId.LABORATORY)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: LaboratoryGetOneQuery
  ) {
    return await this.apiLaboratoryService.getOne(oid, id, query)
  }

  @Post('create')
  @UserPermission(PermissionId.LABORATORY_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: LaboratoryCreateBody) {
    return await this.apiLaboratoryService.create(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.LABORATORY_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: LaboratoryUpdateBody
  ) {
    return await this.apiLaboratoryService.update(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.LABORATORY_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroy(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiLaboratoryService.destroy(oid, id)
  }

  @Get('system-list')
  @OrganizationPermission(PermissionId.LABORATORY)
  async systemList() {
    return await this.apiLaboratoryService.systemList()
  }

  @Post('system-copy')
  @UserPermission(PermissionId.LABORATORY_CREATE)
  async systemCopy(@External() { oid }: TExternal, @Body() body: LaboratorySystemCopyBody) {
    return await this.apiLaboratoryService.systemCopy(oid, body)
  }
}
