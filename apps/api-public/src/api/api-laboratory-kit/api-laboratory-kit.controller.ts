import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiLaboratoryKitService } from './api-laboratory-kit.service'
import {
  LaboratoryKitCreateBody,
  LaboratoryKitGetManyQuery,
  LaboratoryKitPaginationQuery,
  LaboratoryKitUpdateBody,
} from './request'

@ApiTags('LaboratoryKit')
@ApiBearerAuth('access-token')
@Controller('laboratory-kit')
export class ApiLaboratoryKitController {
  constructor(private readonly apiLaboratoryKitService: ApiLaboratoryKitService) { }

  @Get('pagination')
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: LaboratoryKitPaginationQuery) {
    return this.apiLaboratoryKitService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  list(@External() { oid }: TExternal, @Query() query: LaboratoryKitGetManyQuery) {
    return this.apiLaboratoryKitService.getMany(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiLaboratoryKitService.getOne(oid, id)
  }

  @Post('create')
  @HasPermission(PermissionId.MASTER_DATA_LABORATORY)
  async createOne(@External() { oid }: TExternal, @Body() body: LaboratoryKitCreateBody) {
    return await this.apiLaboratoryKitService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.MASTER_DATA_LABORATORY)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: LaboratoryKitUpdateBody
  ) {
    return await this.apiLaboratoryKitService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.MASTER_DATA_LABORATORY)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiLaboratoryKitService.destroyOne(oid, id)
  }
}
