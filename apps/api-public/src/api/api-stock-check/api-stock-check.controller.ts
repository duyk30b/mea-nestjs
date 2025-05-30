import { Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { Body, Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiStockCheckService } from './api-stock-check.service'
import {
  StockCheckGetManyQuery,
  StockCheckGetOneQuery,
  StockCheckPaginationQuery,
  StockCheckUpsertDraftBody,
} from './request'

@ApiTags('StockCheck')
@ApiBearerAuth('access-token')
@Controller('stock-check')
export class ApiStockCheckController {
  constructor(private readonly apiStockCheckService: ApiStockCheckService) { }

  @Get('pagination')
  @HasPermission(PermissionId.STOCK_CHECK_READ)
  async pagination(@External() { oid }: TExternal, @Query() query: StockCheckPaginationQuery) {
    return await this.apiStockCheckService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.STOCK_CHECK_READ)
  async list(@External() { oid }: TExternal, @Query() query: StockCheckGetManyQuery) {
    return await this.apiStockCheckService.getMany(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.STOCK_CHECK_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: StockCheckGetOneQuery
  ) {
    return await this.apiStockCheckService.getOne({ oid, id, query })
  }

  @Post('upsert-draft')
  @HasPermission(PermissionId.STOCK_CHECK_DRAFT_CRUD)
  async upsertDraft(@External() { oid, uid }: TExternal, @Body() body: StockCheckUpsertDraftBody) {
    return await this.apiStockCheckService.upsertDraft({
      oid,
      userId: uid,
      body,
    })
  }

  @Delete('draft-destroy/:id')
  @HasPermission(PermissionId.STOCK_CHECK_DRAFT_CRUD)
  async draftDestroy(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiStockCheckService.destroy({
      oid,
      stockCheckId: id,
    })
  }

  @Post('draft-submit/:id')
  @HasPermission(PermissionId.STOCK_CHECK_DRAFT_CRUD)
  async draftSubmit(@External() { oid, uid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiStockCheckService.draftSubmit({
      oid,
      stockCheckId: id,
      userId: uid,
    })
  }

  @Post('pending-approve/:id')
  @HasPermission(PermissionId.STOCK_CHECK_DRAFT_CRUD)
  async pendingApprove(@External() { oid, uid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiStockCheckService.pendingApprove({
      oid,
      stockCheckId: id,
      userId: uid,
    })
  }

  @Post('confirm-reconcile/:id')
  @HasPermission(PermissionId.STOCK_CHECK_DRAFT_CRUD)
  async confirmReconcile(@External() { oid, uid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiStockCheckService.confirmReconcile({
      oid,
      stockCheckId: id,
      userId: uid,
    })
  }

  @Post('void/:id')
  @HasPermission(PermissionId.STOCK_CHECK_DRAFT_CRUD)
  async void(@External() { oid, uid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiStockCheckService.void({
      oid,
      stockCheckId: id,
      userId: uid,
    })
  }

  @Delete('cancelled-destroy/:id')
  @HasPermission(PermissionId.STOCK_CHECK_CANCELLED_DESTROY)
  async cancelledDestroy(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiStockCheckService.destroy({
      oid,
      stockCheckId: id,
    })
  }
}
