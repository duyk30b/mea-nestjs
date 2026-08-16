import { GenerateIdParam } from '@libs/common/dto/param'
import { UserPermission, UserPermissionOr } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Controller, Param, Post } from '@nestjs/common'
import { Body } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PurchaseOrderPaymentMoneyBody } from '../purchase-order-money/request'
import { PurchaseOrderActionService } from './purchase_order_action.service'
import { PurchaseOrderCancelService } from './purchase_order_cancel.service'
import {
  PurchaseOrderReceiveProductListBody,
  PurchaseOrderReturnProductListBody,
  PurchaseOrderTerminalBody,
} from './request'

@ApiTags('PurchaseOrder')
@ApiBearerAuth('access-token')
@Controller('purchase-order')
export class ApiPurchaseOrderActionController {
  constructor(
    private readonly purchaseOrderActionService: PurchaseOrderActionService,
    private readonly purchaseOrderCancelService: PurchaseOrderCancelService
  ) {}

  // ================== ACTION ================== //
  @Post('/:id/receive-product-list')
  @UserPermission(PermissionId.PURCHASE_ORDER_RECEIVE_PRODUCT)
  async receiveProduct(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: PurchaseOrderReceiveProductListBody
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderActionService.receiveProduct({
      oid,
      purchaseOrderId: id,
      receiveType: 'PARTIAL',
      receiveList: body.receiveList,
    })
    return { data }
  }

  @Post('/:id/receive-product-all')
  @UserPermission(PermissionId.PURCHASE_ORDER_RECEIVE_PRODUCT)
  async receiveProductAll(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderActionService.receiveProduct({
      oid,
      purchaseOrderId: id,
      receiveType: 'ALL',
    })
    return { data }
  }

  @Post('/:id/receive-product-and-payment-and-close')
  @UserPermission(PermissionId.PURCHASE_ORDER_RECEIVE_PRODUCT, PermissionId.PURCHASE_ORDER_CLOSE)
  async receiveProductAndPaymentAndClose(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: PurchaseOrderPaymentMoneyBody
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderActionService.receiveProductAndPaymentAndClose({
      oid,
      userId: uid,
      purchaseOrderId: id,
      body,
    })
    return { data }
  }

  @Post('/:id/return-product-list')
  @UserPermission(PermissionId.PURCHASE_ORDER_RETURN_PRODUCT)
  async returnProductList(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: PurchaseOrderReturnProductListBody
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderActionService.returnProduct({
      oid,
      purchaseOrderId: id,
      returnType: 'PARTIAL',
      returnList: body.returnList,
    })
    return { data }
  }

  @Post('/:id/return-product-all')
  @UserPermission(PermissionId.PURCHASE_ORDER_RETURN_PRODUCT)
  async returnProductAll(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderActionService.returnProduct({
      returnType: 'ALL',
      oid,
      purchaseOrderId: id,
      options: { keepQuantity: true },
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

  @Post('/:id/reopen')
  @UserPermission(PermissionId.PURCHASE_ORDER_REOPEN)
  async reopen(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderActionService.reopen({
      oid,
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
    const data = await this.purchaseOrderCancelService.terminate({
      oid,
      userId: uid,
      purchaseOrderId: id,
      body,
    })
    return { data }
  }

  @Post('/:id/destroy')
  @UserPermissionOr(
    PermissionId.PURCHASE_ORDER_DRAFT_CRUD,
    PermissionId.PURCHASE_ORDER_DEPOSITED_DESTROY,
    PermissionId.PURCHASE_ORDER_CANCELLED_DESTROY
  )
  async destroy(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderCancelService.destroy({
      oid,
      purchaseOrderId: id,
    })
    return { data }
  }
}
