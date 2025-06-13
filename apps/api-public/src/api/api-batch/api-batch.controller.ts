import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiBatchService } from './api-batch.service'
import {
  BatchGetManyQuery,
  BatchGetOneQuery,
  BatchMergeBody,
  BatchPaginationQuery,
  BatchUpdateInfoAndQuantityBody,
  BatchUpdateInfoBody,
} from './request'

@ApiTags('Batch')
@ApiBearerAuth('access-token')
@Controller('batch')
export class ApiBatchController {
  constructor(private readonly apiBatchService: ApiBatchService) { }

  @Get('pagination')
  @OrganizationPermission(PermissionId.PRODUCT)
  async pagination(@External() { oid }: TExternal, @Query() query: BatchPaginationQuery) {
    return this.apiBatchService.pagination(oid, query)
  }

  @Get('list')
  @OrganizationPermission(PermissionId.PRODUCT)
  async list(@External() { oid }: TExternal, @Query() query: BatchGetManyQuery) {
    return await this.apiBatchService.getList(oid, query)
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.PRODUCT)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: BatchGetOneQuery
  ) {
    return await this.apiBatchService.getOne(oid, id, query)
  }

  @Patch('update-info/:id')
  @UserPermission(PermissionId.PRODUCT_UPDATE_BATCH)
  async updateInfo(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: BatchUpdateInfoBody
  ) {
    return await this.apiBatchService.updateInfo(oid, id, body)
  }

  @Patch('update-info-and-quantity-and-cost-price/:id')
  @UserPermission(PermissionId.PRODUCT_CHANGE_QUANTITY_AND_COST_PRICE)
  async updateInfoAndQuantity(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: BatchUpdateInfoAndQuantityBody
  ) {
    return await this.apiBatchService.updateInfoAndQuantity({ oid, batchId: id, body, userId: uid })
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.PRODUCT_DELETE_BATCH)
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiBatchService.destroyOne({ oid, batchId: id })
  }

  @Patch('merge-batch')
  @UserPermission(PermissionId.PRODUCT_MERGE_BATCH)
  async batchMerge(@External() { oid, uid }: TExternal, @Body() body: BatchMergeBody) {
    return await this.apiBatchService.batchMerge({ oid, body })
  }
}
