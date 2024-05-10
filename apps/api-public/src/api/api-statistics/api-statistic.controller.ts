import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
import { ApiStatisticService } from './api-statistic.service'
import {
  StatisticTimeQuery,
  StatisticTopBestSellingQuery,
  StatisticTopCustomerBestInvoiceQuery,
} from './request'
import { StatisticProductHighMoneyQuery } from './request/statistic-top-product-high-money.query'

@ApiTags('Statistic')
@ApiBearerAuth('access-token')
@Controller('statistic')
export class ApiStatisticController {
  constructor(private readonly apiStatisticService: ApiStatisticService) {}

  @Get('sum-warehouse')
  @HasPermission(PermissionId.STATISTIC_PRODUCT)
  async sumWarehouse(@External() { oid }: TExternal) {
    return await this.apiStatisticService.sumWarehouse(oid)
  }

  @Get('top-product-best-selling')
  @HasPermission(PermissionId.STATISTIC_PRODUCT)
  async topProductBestSelling(
    @External() { oid }: TExternal,
    @Query() query: StatisticTopBestSellingQuery
  ) {
    return await this.apiStatisticService.topProductBestSelling(oid, query)
  }

  @Get('top-product-high-money')
  @HasPermission(PermissionId.STATISTIC_PRODUCT)
  async topProductHighSumRetailMoney(
    @External() { oid }: TExternal,
    @Query() query: StatisticProductHighMoneyQuery
  ) {
    return await this.apiStatisticService.topProductHighMoney(oid, query)
  }

  @Get('top-procedure-best-selling')
  @HasPermission(PermissionId.STATISTIC_PROCEDURE)
  async topProcedureHighActualMoney(
    @External() { oid }: TExternal,
    @Query() query: StatisticTopBestSellingQuery
  ) {
    return await this.apiStatisticService.topProcedureBestSelling(oid, query)
  }

  @Get('top-customer-best-invoice')
  @HasPermission(PermissionId.STATISTIC_CUSTOMER)
  async topCustomerBestInvoice(
    @External() { oid }: TExternal,
    @Query() query: StatisticTopCustomerBestInvoiceQuery
  ) {
    return await this.apiStatisticService.topCustomerBestInvoice(oid, query)
  }

  @Get('sum-customer-debt')
  @HasPermission(PermissionId.STATISTIC_CUSTOMER)
  sumCustomerDebt(@External() { oid }: TExternal) {
    return this.apiStatisticService.sumCustomerDebt(oid)
  }

  @Get('sum-money-invoice')
  @HasPermission(PermissionId.STATISTIC_INVOICE)
  async sumMoneyInvoice(@External() { oid }: TExternal, @Query() query: StatisticTimeQuery) {
    return await this.apiStatisticService.sumMoneyInvoice(oid, query)
  }

  @Get('sum-money-receipt')
  @HasPermission(PermissionId.STATISTIC_RECEIPT)
  async sumMoneyReceipt(@External() { oid }: TExternal, @Query() query: StatisticTimeQuery) {
    return await this.apiStatisticService.sumMoneyReceipt(oid, query)
  }

  @Get('sum-invoice-surcharge-and-expense')
  @HasPermission(PermissionId.STATISTIC_INVOICE)
  async sumInvoiceSurcharge(@External() { oid }: TExternal, @Query() query: StatisticTimeQuery) {
    return await this.apiStatisticService.sumInvoiceSurchargeAndExpenses(oid, query)
  }
}
