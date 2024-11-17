import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiLaboratoryService } from './api-laboratory.service'
import {
  LaboratoryGetManyQuery,
  LaboratoryGetOneQuery,
  LaboratoryPaginationQuery,
  LaboratoryUpsertBody,
} from './request'

@ApiTags('Laboratory')
@ApiBearerAuth('access-token')
@Controller('laboratory')
export class ApiLaboratoryController {
  constructor(private readonly apiLaboratoryService: ApiLaboratoryService) { }

  @Get('pagination')
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: LaboratoryPaginationQuery) {
    return this.apiLaboratoryService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  async list(@External() { oid }: TExternal, @Query() query: LaboratoryGetManyQuery) {
    return await this.apiLaboratoryService.getMany(oid, query)
  }

  @Get('example-list')
  @IsUser()
  async exampleList() {
    return await this.apiLaboratoryService.exampleList()
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.MASTER_DATA_LABORATORY)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: LaboratoryGetOneQuery
  ) {
    return await this.apiLaboratoryService.getOne(oid, id, query)
  }

  @Post('create')
  @HasPermission(PermissionId.MASTER_DATA_LABORATORY)
  async create(@External() { oid }: TExternal, @Body() body: LaboratoryUpsertBody) {
    return await this.apiLaboratoryService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.MASTER_DATA_LABORATORY)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: LaboratoryUpsertBody
  ) {
    return await this.apiLaboratoryService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.MASTER_DATA_LABORATORY)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiLaboratoryService.destroyOne(oid, id)
  }
}
