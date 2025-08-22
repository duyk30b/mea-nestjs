import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
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
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: BatchPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiBatchService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @OrganizationPermission(PermissionId.PRODUCT)
  async list(
    @External() { oid }: TExternal,
    @Query() query: BatchGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiBatchService.getList(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.PRODUCT)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: BatchGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiBatchService.getOne(oid, id, query)
    return { data }
  }

  @Patch('update-info/:id')
  @UserPermission(PermissionId.PRODUCT_UPDATE_BATCH)
  async updateInfo(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: BatchUpdateInfoBody
  ): Promise<BaseResponse> {
    const data = await this.apiBatchService.updateInfo(oid, id, body)
    return { data }
  }

  @Patch('update-info-and-quantity-and-cost-price/:id')
  @UserPermission(PermissionId.PRODUCT_CHANGE_QUANTITY_AND_COST_PRICE)
  async updateInfoAndQuantity(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: BatchUpdateInfoAndQuantityBody
  ): Promise<BaseResponse> {
    const data = await this.apiBatchService.updateInfoAndQuantity({
      oid,
      batchId: id,
      body,
      userId: uid,
    })
    return { data }
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.PRODUCT_DELETE_BATCH)
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: IdParam): Promise<BaseResponse> {
    const data = await this.apiBatchService.destroyOne({ oid, batchId: id })
    return { data }
  }

  @Patch('merge-batch')
  @UserPermission(PermissionId.PRODUCT_MERGE_BATCH)
  async batchMerge(
    @External() { oid, uid }: TExternal,
    @Body() body: BatchMergeBody
  ): Promise<BaseResponse> {
    const data = await this.apiBatchService.batchMerge({ oid, body })
    return { data }
  }
}
