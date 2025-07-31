import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiPaymentService } from './api-payment.service'
import { PaymentActionService } from './payment-action.service'
import {
  CustomerPayDebtBody,
  CustomerPrepaymentBody,
  CustomerPrepaymentTicketItemListBody,
  CustomerRefundMoneyBody,
  CustomerRefundTicketItemListBody,
  DistributorPayDebtBody,
  DistributorPrepaymentBody,
  DistributorRefundMoneyBody,
  OtherPaymentBody,
  PaymentGetManyQuery,
  PaymentPaginationQuery,
  PaymentPostQuery,
} from './request'

@ApiTags('Payment')
@ApiBearerAuth('access-token')
@Controller('payment')
export class ApiPaymentController {
  constructor(
    private readonly apiPaymentService: ApiPaymentService,
    private readonly paymentActionService: PaymentActionService
  ) { }

  @Get('pagination')
  @UserPermission() // tạm thời để thế này trước
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: PaymentPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPaymentService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission() // tạm thời để thế này trước
  async list(
    @External() { oid }: TExternal,
    @Query() query: PaymentGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPaymentService.getMany(oid, query)
    return { data }
  }

  @Get('sum-money')
  @UserPermission() // tạm thời để thế này trước
  async sumMoney(
    @External() { oid }: TExternal,
    @Query() query: PaymentGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.sumMoney(oid, query)
    return { data }
  }

  @Post('customer-prepayment-money')
  @UserPermission(PermissionId.PAYMENT_CUSTOMER_PAYMENT)
  async customerPrepaymentMoney(
    @External() { oid, uid }: TExternal,
    @Body() body: CustomerPrepaymentBody,
    @Query() query: PaymentPostQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.customerPrepaymentMoney({
      oid,
      userId: uid,
      body,
      query,
    })
    return { data }
  }

  @Post('customer-pay-debt')
  @UserPermission(PermissionId.PAYMENT_CUSTOMER_PAYMENT)
  async customerPayDebt(
    @External() { oid, uid }: TExternal,
    @Body() body: CustomerPayDebtBody,
    @Query() query: PaymentPostQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.customerPayDebt({
      oid,
      userId: uid,
      body,
      query,
    })
    return { data }
  }

  @Post('customer-refund-money')
  @UserPermission(PermissionId.PAYMENT_CUSTOMER_REFUND)
  async customerRefundMoney(
    @External() { oid, uid }: TExternal,
    @Body() body: CustomerRefundMoneyBody
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.customerRefundMoney({ oid, userId: uid, body })
    return { data }
  }

  @Post('distributor-prepayment-money')
  @UserPermission(PermissionId.PAYMENT_DISTRIBUTOR_PAYMENT)
  async distributorPrepaymentMoney(
    @External() { oid, uid }: TExternal,
    @Body() body: DistributorPrepaymentBody,
    @Query() query: PaymentPostQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.distributorPrepaymentMoney({
      oid,
      userId: uid,
      body,
      query,
    })
    return { data }
  }

  @Post('distributor-pay-debt')
  @UserPermission(PermissionId.PAYMENT_DISTRIBUTOR_PAYMENT)
  async distributorPayDebt(
    @External() { oid, uid }: TExternal,
    @Body() body: DistributorPayDebtBody,
    @Query() query: PaymentPostQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.distributorPayDebt({
      oid,
      userId: uid,
      body,
      query,
    })
    return { data }
  }

  @Post('distributor-refund-money')
  @UserPermission(PermissionId.PAYMENT_DISTRIBUTOR_REFUND)
  async distributorRefundMoney(
    @External() { oid, uid }: TExternal,
    @Body() body: DistributorRefundMoneyBody
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.distributorRefundMoney({ oid, userId: uid, body })
    return { data }
  }

  @Post('customer-prepayment-ticket-item-list')
  @UserPermission(PermissionId.PAYMENT_CUSTOMER_PAYMENT)
  async customerPrepaymentTicketItemList(
    @External() { oid, uid }: TExternal,
    @Body() body: CustomerPrepaymentTicketItemListBody,
    @Query() query: PaymentPostQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.customerPrepaymentTicketItemList({
      oid,
      userId: uid,
      body,
      query,
    })
    return { data }
  }

  @Post('customer-refund-ticket-item-list')
  @UserPermission(PermissionId.PAYMENT_CUSTOMER_REFUND)
  async customerRefundTicketItemList(
    @External() { oid, uid }: TExternal,
    @Body() body: CustomerRefundTicketItemListBody
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.customerRefundTicketItemList({
      oid,
      userId: uid,
      body,
    })
    return { data }
  }

  @Post('other-money-in')
  @UserPermission(PermissionId.PAYMENT_OTHER_MONEY_IN)
  async otherPaymentMoneyIn(
    @External() { oid, user }: TExternal,
    @Body() body: OtherPaymentBody
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.otherPaymentMoneyIn({ oid, body, userId: user.id })
    return { data }
  }

  @Post('other-money-out')
  @UserPermission(PermissionId.PAYMENT_OTHER_MONEY_OUT)
  async otherPaymentMoneyOut(
    @External() { oid, user }: TExternal,
    @Body() body: OtherPaymentBody
  ): Promise<BaseResponse> {
    const data = await this.paymentActionService.otherPaymentMoneyOut({
      oid,
      body,
      userId: user.id,
    })
    return { data }
  }
}
