import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { LaboratoryService } from './laboratory.service'
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
export class LaboratoryController {
  constructor(private readonly laboratoryService: LaboratoryService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: LaboratoryPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.laboratoryService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: LaboratoryGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.laboratoryService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: LaboratoryGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.laboratoryService.getOne(oid, id, query)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY)
  async create(
    @External() { oid }: TExternal,
    @Body() body: LaboratoryCreateBody
  ): Promise<BaseResponse> {
    const data = await this.laboratoryService.create(oid, body)
    return { data }
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: LaboratoryUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.laboratoryService.update(oid, id, body)
    return { data }
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY)
  @ApiParam({ name: 'id', example: 1 })
  async destroy(@External() { oid }: TExternal, @Param() { id }: IdParam): Promise<BaseResponse> {
    const data = await this.laboratoryService.destroy(oid, id)
    return { data }
  }

  @Get('system-list')
  @UserPermission()
  async systemList(): Promise<BaseResponse> {
    const data = await this.laboratoryService.systemList()
    return { data }
  }

  @Post('system-copy')
  @UserPermission(PermissionId.MASTER_DATA_LABORATORY)
  async systemCopy(
    @External() { oid }: TExternal,
    @Body() body: LaboratorySystemCopyBody
  ): Promise<BaseResponse> {
    const data = await this.laboratoryService.systemCopy(oid, body)
    return { data }
  }
}
