import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiParaclinicalService } from './api-paraclinical.service'
import {
  ParaclinicalGetManyQuery,
  ParaclinicalGetOneQuery,
  ParaclinicalPaginationQuery,
  ParaclinicalUpdateInfoBody,
  ParaclinicalUpsertBody,
} from './request'

@ApiTags('Paraclinical')
@ApiBearerAuth('access-token')
@Controller('paraclinical')
export class ApiParaclinicalController {
  constructor(private readonly apiParaclinicalService: ApiParaclinicalService) { }

  @Get('pagination')
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: ParaclinicalPaginationQuery) {
    return this.apiParaclinicalService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  async list(@External() { oid }: TExternal, @Query() query: ParaclinicalGetManyQuery) {
    return await this.apiParaclinicalService.getMany(oid, query)
  }

  @Get('example-list')
  @IsUser()
  async exampleList() {
    return await this.apiParaclinicalService.exampleList()
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.MASTER_DATA_PARACLINICAL)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: ParaclinicalGetOneQuery
  ) {
    return await this.apiParaclinicalService.getOne(oid, id, query)
  }

  @Post('create')
  @HasPermission(PermissionId.MASTER_DATA_PARACLINICAL)
  async create(@External() { oid }: TExternal, @Body() body: ParaclinicalUpsertBody) {
    return await this.apiParaclinicalService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.MASTER_DATA_PARACLINICAL)
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ParaclinicalUpsertBody
  ) {
    return await this.apiParaclinicalService.updateOne(oid, id, body)
  }

  @Patch('update-info/:id')
  @HasPermission(PermissionId.MASTER_DATA_PARACLINICAL)
  @ApiParam({ name: 'id', example: 1 })
  async updateInfo(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ParaclinicalUpdateInfoBody
  ) {
    return await this.apiParaclinicalService.updateInfo(oid, id, body)
  }

  @Delete('delete/:id')
  @HasPermission(PermissionId.MASTER_DATA_PARACLINICAL)
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiParaclinicalService.deleteOne(oid, id)
  }
}
