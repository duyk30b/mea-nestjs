import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
import { ApiBatchService } from './api-batch.service'
import {
  BatchGetManyQuery,
  BatchGetOneQuery,
  BatchInsertBody,
  BatchPaginationQuery,
  BatchUpdateBody,
} from './request'

@ApiTags('Batch')
@ApiBearerAuth('access-token')
@Controller('batch')
export class ApiBatchController {
  constructor(private readonly apiBatchService: ApiBatchService) {}

  @Get('pagination')
  @HasPermission(PermissionId.BATCH_READ)
  pagination(@External() { oid }: TExternal, @Query() query: BatchPaginationQuery) {
    return this.apiBatchService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.BATCH_READ)
  async list(@External() { oid }: TExternal, @Query() query: BatchGetManyQuery) {
    return await this.apiBatchService.getList(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.BATCH_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: BatchGetOneQuery
  ) {
    return await this.apiBatchService.getOne(oid, id, query)
  }

  @Post('create')
  @HasPermission(PermissionId.BATCH_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: BatchInsertBody) {
    return await this.apiBatchService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.BATCH_UPDATE)
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: BatchUpdateBody
  ) {
    return await this.apiBatchService.updateOne(oid, id, body)
  }
}
