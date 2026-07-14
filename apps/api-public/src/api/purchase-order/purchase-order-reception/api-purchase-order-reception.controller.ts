import { GenerateIdParam } from '@libs/common/dto/param'
import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Controller, Param, Post } from '@nestjs/common'
import { Body } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ApiPurchaseOrderReceptionService } from './purchase-order-reception.service'
import {
    PurchaseOrderDepositedUpdateBody,
    PurchaseOrderDraftInsertBody,
    PurchaseOrderDraftUpdateBody,
} from './request'

@ApiTags('PurchaseOrder')
@ApiBearerAuth('access-token')
@Controller('purchase-order')
export class ApiPurchaseOrderReceptionController {
  constructor(
    private readonly apiPurchaseOrderReceptionService: ApiPurchaseOrderReceptionService
  ) { }

  @Post('draft-insert')
  @UserPermission(PermissionId.PURCHASE_ORDER_DRAFT_CRUD)
  async draftInsert(
    @External() { oid }: TExternal,
    @Body() body: PurchaseOrderDraftInsertBody
  ): Promise<BaseResponse> {
    const data = await this.apiPurchaseOrderReceptionService.draftInsert({ oid, body })
    return { data }
  }

  @Post('/:id/draft-update')
  @UserPermission(PermissionId.PURCHASE_ORDER_DRAFT_CRUD)
  async draftUpdate(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: PurchaseOrderDraftUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiPurchaseOrderReceptionService.draftUpdate({
      oid,
      purchaseOrderId: id,
      body,
    })
    return { data }
  }

  @Post('/:id/deposited-update')
  @UserPermission(PermissionId.PURCHASE_ORDER_DEPOSITED_UPDATE)
  async depositedUpdate(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: PurchaseOrderDepositedUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiPurchaseOrderReceptionService.depositedUpdate({
      oid,
      purchaseOrderId: id,
      body,
    })
    return { data }
  }
}
