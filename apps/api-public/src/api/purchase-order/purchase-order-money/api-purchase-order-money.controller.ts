import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { PurchaseOrderMoneyService } from './purchase-order-money.service'
import {
  DistributorPayDebtBody,
  DistributorPrepaymentBody,
  DistributorRefundMoneyBody,
} from './request'

@ApiTags('PurchaseOrder')
@ApiBearerAuth('access-token')
@Controller('purchase-order')
export class ApiPurchaseOrderMoneyController {
  constructor(private readonly purchaseOrderMoneyService: PurchaseOrderMoneyService) { }

  @Post('/:id/prepayment-money')
  @UserPermission(PermissionId.PURCHASE_ORDER_PAYMENT_MONEY)
  async prepaymentMoney(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: DistributorPrepaymentBody
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderMoneyService.prepaymentMoney({
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
    @Body() body: DistributorPayDebtBody
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderMoneyService.payDebt({
      oid,
      userId: uid,
      body,
    })
    return { data }
  }

  @Post('/:id/refund-money')
  @UserPermission(PermissionId.PURCHASE_ORDER_REFUND_MONEY)
  async refundMoney(
    @External() { oid, uid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: DistributorRefundMoneyBody
  ): Promise<BaseResponse> {
    const data = await this.purchaseOrderMoneyService.refundMoney({
      oid,
      userId: uid,
      body,
      purchaseOrderId: id,
    })
    return { data }
  }
}
