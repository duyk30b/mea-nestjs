import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
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
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: LaboratoryPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiLaboratoryService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: LaboratoryGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiLaboratoryService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission(PermissionId.LABORATORY)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: LaboratoryGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiLaboratoryService.getOne(oid, id, query)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.LABORATORY_CREATE)
  async create(
    @External() { oid }: TExternal,
    @Body() body: LaboratoryCreateBody
  ): Promise<BaseResponse> {
    const data = await this.apiLaboratoryService.create(oid, body)
    return { data }
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.LABORATORY_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: LaboratoryUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiLaboratoryService.update(oid, id, body)
    return { data }
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.LABORATORY_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async destroy(@External() { oid }: TExternal, @Param() { id }: IdParam): Promise<BaseResponse> {
    const data = await this.apiLaboratoryService.destroy(oid, id)
    return { data }
  }

  @Get('system-list')
  @UserPermission()
  async systemList(): Promise<BaseResponse> {
    const data = await this.apiLaboratoryService.systemList()
    return { data }
  }

  @Post('system-copy')
  @UserPermission(PermissionId.LABORATORY_CREATE)
  async systemCopy(
    @External() { oid }: TExternal,
    @Body() body: LaboratorySystemCopyBody
  ): Promise<BaseResponse> {
    const data = await this.apiLaboratoryService.systemCopy(oid, body)
    return { data }
  }
}
