import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiPaymentService } from './api-payment.service'
import { PaymentCustomerService } from './payment-customer.service'
import { PaymentDistributorService } from './payment-distributor.service'
import { PaymentOtherService } from './payment-other.service'
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
  PaymentUpdateInfoBody,
} from './request'

@ApiTags('Payment')
@ApiBearerAuth('access-token')
@Controller('payment')
export class ApiPaymentController {
  constructor(
    private readonly apiPaymentService: ApiPaymentService,
    private readonly paymentCustomerService: PaymentCustomerService,
    private readonly paymentDistributorService: PaymentDistributorService,
    private readonly paymentOtherService: PaymentOtherService
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

  @Post('update-info/:id')
  @UserPermission(PermissionId.PAYMENT_UPDATE_INFO)
  async moneyOutUpdateInfo(
    @External() { oid, user }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: PaymentUpdateInfoBody
  ): Promise<BaseResponse> {
    const data = await this.apiPaymentService.updateInfo({
      oid,
      paymentId: id,
      body,
      userId: user.id,
    })
    return { data }
  }

  @Get('sum-money')
  @UserPermission() // tạm thời để thế này trước
  async sumMoney(
    @External() { oid }: TExternal,
    @Query() query: PaymentGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPaymentService.sumMoney(oid, query)
    return { data }
  }

  @Post('distributor-prepayment-money')
  @UserPermission(PermissionId.PAYMENT_DISTRIBUTOR_PAYMENT_MONEY)
  async distributorPrepaymentMoney(
    @External() { oid, uid }: TExternal,
    @Body() body: DistributorPrepaymentBody,
    @Query() query: PaymentPostQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentDistributorService.distributorPrepaymentMoney({
      oid,
      userId: uid,
      body,
      query,
    })
    return { data }
  }

  @Post('distributor-pay-debt')
  @UserPermission(PermissionId.PAYMENT_DISTRIBUTOR_PAYMENT_MONEY)
  async distributorPayDebt(
    @External() { oid, uid }: TExternal,
    @Body() body: DistributorPayDebtBody,
    @Query() query: PaymentPostQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentDistributorService.distributorPayDebt({
      oid,
      userId: uid,
      body,
      query,
    })
    return { data }
  }

  @Post('distributor-refund-money')
  @UserPermission(PermissionId.PAYMENT_DISTRIBUTOR_REFUND_MONEY)
  async distributorRefundMoney(
    @External() { oid, uid }: TExternal,
    @Body() body: DistributorRefundMoneyBody
  ): Promise<BaseResponse> {
    const data = await this.paymentDistributorService.distributorRefundMoney({
      oid,
      userId: uid,
      body,
    })
    return { data }
  }

  @Post('customer-prepayment-money')
  @UserPermission(PermissionId.PAYMENT_CUSTOMER_PAYMENT_MONEY)
  async customerPrepaymentMoney(
    @External() { oid, uid }: TExternal,
    @Body() body: CustomerPrepaymentBody,
    @Query() query: PaymentPostQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentCustomerService.customerPrepaymentMoney({
      oid,
      userId: uid,
      body,
      query,
    })
    return { data }
  }

  @Post('customer-pay-debt')
  @UserPermission(PermissionId.PAYMENT_CUSTOMER_PAYMENT_MONEY)
  async customerPayDebt(
    @External() { oid, uid }: TExternal,
    @Body() body: CustomerPayDebtBody,
    @Query() query: PaymentPostQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentCustomerService.customerPayDebt({
      oid,
      userId: uid,
      body,
      query,
    })
    return { data }
  }

  @Post('customer-refund-money')
  @UserPermission(PermissionId.PAYMENT_CUSTOMER_REFUND_MONEY)
  async customerRefundMoney(
    @External() { oid, uid }: TExternal,
    @Body() body: CustomerRefundMoneyBody
  ): Promise<BaseResponse> {
    const data = await this.paymentCustomerService.customerRefundMoney({ oid, userId: uid, body })
    return { data }
  }

  @Post('customer-prepayment-ticket-item-list')
  @UserPermission(PermissionId.PAYMENT_CUSTOMER_PAYMENT_MONEY)
  async customerPrepaymentTicketItemList(
    @External() { oid, uid }: TExternal,
    @Body() body: CustomerPrepaymentTicketItemListBody,
    @Query() query: PaymentPostQuery
  ): Promise<BaseResponse> {
    const data = await this.paymentCustomerService.customerPrepaymentTicketItemList({
      oid,
      userId: uid,
      body,
      query,
    })
    return { data }
  }

  @Post('customer-refund-ticket-item-list')
  @UserPermission(PermissionId.PAYMENT_CUSTOMER_REFUND_MONEY)
  async customerRefundTicketItemList(
    @External() { oid, uid }: TExternal,
    @Body() body: CustomerRefundTicketItemListBody
  ): Promise<BaseResponse> {
    const data = await this.paymentCustomerService.customerRefundTicketItemList({
      oid,
      userId: uid,
      body,
    })
    return { data }
  }

  @Post('other/create-money-out')
  @UserPermission(PermissionId.PAYMENT_OTHER_CREATE_MONEY_OUT)
  async otherCreateMoneyOut(
    @External() { oid, user }: TExternal,
    @Body() body: OtherPaymentBody
  ): Promise<BaseResponse> {
    const data = await this.paymentOtherService.createMoneyOut({
      oid,
      body,
      userId: user.id,
    })
    return { data }
  }

  @Post('other/create-money-in')
  @UserPermission(PermissionId.PAYMENT_OTHER_CREATE_MONEY_IN)
  async moneyInCreateOther(
    @External() { oid, user }: TExternal,
    @Body() body: OtherPaymentBody
  ): Promise<BaseResponse> {
    const data = await this.paymentOtherService.createMoneyIn({
      oid,
      body,
      userId: user.id,
    })
    return { data }
  }

  @Post('other/destroy-money-out/:id')
  @UserPermission(PermissionId.PAYMENT_OTHER_DESTROY_MONEY_OUT)
  async moneyOutDestroyOther(
    @External() { oid, user }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.paymentOtherService.destroyMoneyOut({
      oid,
      paymentId: id,
      userId: user.id,
    })
    return { data }
  }

  @Post('other/destroy-money-in/:id')
  @UserPermission(PermissionId.PAYMENT_OTHER_DESTROY_MONEY_IN)
  async moneyInDestroyOther(
    @External() { oid, user }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.paymentOtherService.destroyMoneyIn({
      oid,
      paymentId: id,
      userId: user.id,
    })
    return { data }
  }
}
