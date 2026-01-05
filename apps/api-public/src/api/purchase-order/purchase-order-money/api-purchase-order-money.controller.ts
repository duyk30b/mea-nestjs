import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GenerateIdParam } from '../../../../../_libs/common/dto'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { PurchaseOrderMoneyService } from './purchase-order-money.service'
import { PurchaseOrderPayDebtBody, PurchaseOrderPaymentMoneyBody } from './request'

@ApiTags('PurchaseOrder')
@ApiBearerAuth('access-token')
@Controller('purchase-order')
export class ApiPurchaseOrderMoneyController {
  constructor(private readonly purchaseOrderMoneyService: PurchaseOrderMoneyService) { }

  @Post('/:id/payment-money')
  @UserPermission(PermissionId.PURCHASE_ORDER_PAYMENT_MONEY)
  async payment(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: PurchaseOrderPaymentMoneyBody
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderMoneyService.paymentMoney({
      oid,
      userId: uid,
      body,
      purchaseOrderId: id,
    })
    return { data }
  }

  @Post('pay-debt')
  @UserPermission(PermissionId.PURCHASE_ORDER_PAYMENT_MONEY)
  async payDebt(
    @External() { oid, uid }: TExternal,
    @Body() body: PurchaseOrderPayDebtBody
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderMoneyService.payDebt({
      oid,
      userId: uid,
      body,
    })
    return { data }
  }
}
