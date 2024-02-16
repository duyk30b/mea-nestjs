import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
import { ApiProductBatchService } from './api-product-batch.service'
import {
  ProductBatchGetManyQuery,
  ProductBatchGetOneQuery,
  ProductBatchInsertBody,
  ProductBatchPaginationQuery,
  ProductBatchUpdateBody,
} from './request'

@ApiTags('Product Batch')
@ApiBearerAuth('access-token')
@Controller('product-batch')
export class ApiProductBatchController {
  constructor(private readonly apiProductBatchService: ApiProductBatchService) {}

  @Get('pagination')
  @HasPermission(PermissionId.PRODUCT_BATCH_READ)
  pagination(@External() { oid }: TExternal, @Query() query: ProductBatchPaginationQuery) {
    return this.apiProductBatchService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.PRODUCT_BATCH_READ)
  async list(@External() { oid }: TExternal, @Query() query: ProductBatchGetManyQuery) {
    return await this.apiProductBatchService.getList(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.PRODUCT_BATCH_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: ProductBatchGetOneQuery
  ) {
    return await this.apiProductBatchService.getOne(oid, id, query)
  }

  @Post('create')
  @HasPermission(PermissionId.PRODUCT_BATCH_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: ProductBatchInsertBody) {
    return await this.apiProductBatchService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.PRODUCT_BATCH_UPDATE)
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ProductBatchUpdateBody
  ) {
    return await this.apiProductBatchService.updateOne(oid, id, body)
  }

  @Delete('delete/:id')
  @HasPermission(PermissionId.PRODUCT_BATCH_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async delete(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiProductBatchService.deleteOne(oid, id)
  }
}
