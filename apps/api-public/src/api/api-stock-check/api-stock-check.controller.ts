import { Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { Body, Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GenerateIdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
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
  @OrganizationPermission(PermissionId.STOCK_CHECK)
  async pagination(@External() { oid }: TExternal, @Query() query: StockCheckPaginationQuery) {
    return await this.apiStockCheckService.pagination(oid, query)
  }

  @Get('list')
  @OrganizationPermission(PermissionId.STOCK_CHECK)
  async list(@External() { oid }: TExternal, @Query() query: StockCheckGetManyQuery) {
    return await this.apiStockCheckService.getMany(oid, query)
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.STOCK_CHECK)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Query() query: StockCheckGetOneQuery
  ) {
    return await this.apiStockCheckService.getOne({ oid, id, query })
  }

  @Post('upsert-draft')
  @UserPermission(PermissionId.STOCK_CHECK_DRAFT_CRUD)
  async upsertDraft(@External() { oid, uid }: TExternal, @Body() body: StockCheckUpsertDraftBody) {
    return await this.apiStockCheckService.upsertDraft({
      oid,
      userId: uid,
      body,
    })
  }

  @Delete('draft-destroy/:id')
  @UserPermission(PermissionId.STOCK_CHECK_DRAFT_CRUD)
  async draftDestroy(@External() { oid }: TExternal, @Param() { id }: GenerateIdParam) {
    return await this.apiStockCheckService.destroy({
      oid,
      stockCheckId: id,
    })
  }

  @Post('draft-submit/:id')
  @UserPermission(PermissionId.STOCK_CHECK_DRAFT_CRUD)
  async draftSubmit(@External() { oid, uid }: TExternal, @Param() { id }: GenerateIdParam) {
    return await this.apiStockCheckService.draftSubmit({
      oid,
      stockCheckId: id,
      userId: uid,
    })
  }

  @Post('pending-approve/:id')
  @UserPermission(PermissionId.STOCK_CHECK_DRAFT_CRUD)
  async pendingApprove(@External() { oid, uid }: TExternal, @Param() { id }: GenerateIdParam) {
    return await this.apiStockCheckService.pendingApprove({
      oid,
      stockCheckId: id,
      userId: uid,
    })
  }

  @Post('confirm-reconcile/:id')
  @UserPermission(PermissionId.STOCK_CHECK_DRAFT_CRUD)
  async confirmReconcile(@External() { oid, uid }: TExternal, @Param() { id }: GenerateIdParam) {
    return await this.apiStockCheckService.confirmReconcile({
      oid,
      stockCheckId: id,
      userId: uid,
    })
  }

  @Post('void/:id')
  @UserPermission(PermissionId.STOCK_CHECK_DRAFT_CRUD)
  async void(@External() { oid, uid }: TExternal, @Param() { id }: GenerateIdParam) {
    return await this.apiStockCheckService.void({
      oid,
      stockCheckId: id,
      userId: uid,
    })
  }

  @Delete('cancelled-destroy/:id')
  @UserPermission(PermissionId.STOCK_CHECK_CANCELLED_DESTROY)
  async cancelledDestroy(@External() { oid }: TExternal, @Param() { id }: GenerateIdParam) {
    return await this.apiStockCheckService.destroy({
      oid,
      stockCheckId: id,
    })
  }
}
