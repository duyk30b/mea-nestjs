import { Controller, Delete, Param, Post } from '@nestjs/common'
import { Body } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GenerateIdParam } from '../../../../../_libs/common/dto/param'
import { UserPermission, UserPermissionOr } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { PurchaseOrderPaymentBody } from '../purchase-order-money/request'
import { PurchaseOrderActionService } from './purchase-order-action.service'
import { PurchaseOrderTerminalBody } from './request'

@ApiTags('PurchaseOrder')
@ApiBearerAuth('access-token')
@Controller('purchase-order')
export class ApiPurchaseOrderActionController {
  constructor(private readonly purchaseOrderActionService: PurchaseOrderActionService) { }

  // ================== ACTION ================== //

  @Delete('/:id/destroy')
  @UserPermissionOr(
    PermissionId.PURCHASE_ORDER_DRAFT_CRUD,
    PermissionId.PURCHASE_ORDER_DEPOSITED_DESTROY,
    PermissionId.PURCHASE_ORDER_CANCELLED_DESTROY
  )
  async draftDestroy(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderActionService.destroy({
      oid,
      purchaseOrderId: id,
    })
    return { data }
  }

  @Post('/:id/send-product-and-payment-and-close')
  @UserPermission(PermissionId.PURCHASE_ORDER_SEND_PRODUCT, PermissionId.PURCHASE_ORDER_CLOSE)
  async sendProductAndPaymentAndClose(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: PurchaseOrderPaymentBody
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderActionService.sendProductAndPaymentAndClose({
      oid,
      userId: uid,
      purchaseOrderId: id,
      body,
    })
    return { data }
  }

  @Post('/:id/send-product')
  @UserPermission(PermissionId.PURCHASE_ORDER_SEND_PRODUCT)
  async sendProduct(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderActionService.sendProduct({
      oid,
      userId: uid,
      purchaseOrderId: id,
    })
    return { data }
  }

  @Post('/:id/close')
  @UserPermission(PermissionId.PURCHASE_ORDER_CLOSE)
  async close(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderActionService.close({
      oid,
      userId: uid,
      purchaseOrderId: id,
    })
    return { data }
  }

  @Post('/:id/terminate')
  @UserPermission(PermissionId.PURCHASE_ORDER_TERMINATE)
  async terminate(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: PurchaseOrderTerminalBody
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderActionService.terminate({
      oid,
      userId: uid,
      purchaseOrderId: id,
      body,
    })
    return { data }
  }
}
