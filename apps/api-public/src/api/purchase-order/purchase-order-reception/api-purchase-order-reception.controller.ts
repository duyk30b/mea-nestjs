import { Controller, Param, Patch, Post } from '@nestjs/common'
import { Body } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { ApiPurchaseOrderReceptionService } from './purchase-order-reception.service'
import { PurchaseOrderUpdateDepositedBody, PurchaseOrderUpsertDraftBody } from './request'

@ApiTags('PurchaseOrder')
@ApiBearerAuth('access-token')
@Controller('purchase-order')
export class ApiPurchaseOrderReceptionController {
  constructor(
    private readonly apiPurchaseOrderReceptionService: ApiPurchaseOrderReceptionService
  ) { }

  @Post('create-draft')
  @UserPermission(PermissionId.PURCHASE_ORDER_DRAFT_CRUD)
  async createDraft(
    @External() { oid }: TExternal,
    @Body() body: PurchaseOrderUpsertDraftBody
  ): Promise<BaseResponse> {
    const data = await this.apiPurchaseOrderReceptionService.createDraft({ oid, body })
    return { data }
  }

  @Patch('/:id/update-draft')
  @UserPermission(PermissionId.PURCHASE_ORDER_DRAFT_CRUD)
  async updateDraft(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: PurchaseOrderUpsertDraftBody
  ): Promise<BaseResponse> {
    const data = await this.apiPurchaseOrderReceptionService.updateDraft({
      oid,
      purchaseOrderId: id,
      body,
    })
    return { data }
  }

  @Patch('/:id/deposited-update')
  @UserPermission(PermissionId.PURCHASE_ORDER_DEPOSITED_UPDATE)
  async depositedUpdate(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: PurchaseOrderUpdateDepositedBody
  ): Promise<BaseResponse> {
    const data = await this.apiPurchaseOrderReceptionService.depositedUpdate({
      oid,
      purchaseOrderId: id,
      body,
    })
    return { data }
  }
}
