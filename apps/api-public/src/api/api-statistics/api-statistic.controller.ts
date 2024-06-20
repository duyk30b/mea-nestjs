import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { HasPermission } from '../../guards/permission.guard'
import { ApiStatisticInvoiceService } from './api-statistic-invoice.service'
import { ApiStatisticReceiptService } from './api-statistic-receipt.service'
import { ApiStatisticVisitService } from './api-statistic-visit.service'
import { ApiStatisticService } from './api-statistic.service'
import {
  StatisticProductHighMoneyQuery,
  StatisticTimeQuery,
  StatisticTopBestSellingQuery,
  StatisticTopCustomerBestInvoiceQuery,
  StatisticTopCustomerBestVisitQuery,
} from './request'

@ApiTags('Statistic')
@ApiBearerAuth('access-token')
@Controller('statistic')
export class ApiStatisticController {
  constructor(
    private readonly apiStatisticService: ApiStatisticService,
    private readonly apiStatisticReceiptService: ApiStatisticReceiptService,
    private readonly apiStatisticInvoiceService: ApiStatisticInvoiceService,
    private readonly apiStatisticVisitService: ApiStatisticVisitService
  ) {}

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

  @Get('top-invoice-procedure-best-selling')
  @HasPermission(PermissionId.STATISTIC_PROCEDURE)
  async topInvoiceProcedureBestSelling(
    @External() { oid }: TExternal,
    @Query() query: StatisticTopBestSellingQuery
  ) {
    return await this.apiStatisticService.topInvoiceProcedureBestSelling(oid, query)
  }

  @Get('top-visit-procedure-best-selling')
  @HasPermission(PermissionId.STATISTIC_PROCEDURE)
  async topVisitProcedureBestSelling(
    @External() { oid }: TExternal,
    @Query() query: StatisticTopBestSellingQuery
  ) {
    return await this.apiStatisticService.topVisitProcedureBestSelling(oid, query)
  }

  @Get('top-customer-best-invoice')
  @HasPermission(PermissionId.STATISTIC_CUSTOMER)
  async topCustomerBestInvoice(
    @External() { oid }: TExternal,
    @Query() query: StatisticTopCustomerBestInvoiceQuery
  ) {
    return await this.apiStatisticService.topCustomerBestInvoice(oid, query)
  }

  @Get('top-customer-best-visit')
  @HasPermission(PermissionId.STATISTIC_CUSTOMER)
  async topCustomerBestVisit(
    @External() { oid }: TExternal,
    @Query() query: StatisticTopCustomerBestVisitQuery
  ) {
    return await this.apiStatisticService.topCustomerBestVisit(oid, query)
  }

  @Get('sum-customer-debt')
  @HasPermission(PermissionId.STATISTIC_CUSTOMER)
  sumCustomerDebt(@External() { oid }: TExternal) {
    return this.apiStatisticService.sumCustomerDebt(oid)
  }

  @Get('statistic-receipt')
  @HasPermission(PermissionId.STATISTIC_VISIT)
  async statisticReceipt(@External() { oid }: TExternal, @Query() query: StatisticTimeQuery) {
    return await this.apiStatisticReceiptService.statisticReceipt(oid, query)
  }

  @Get('statistic-invoice')
  @HasPermission(PermissionId.STATISTIC_VISIT)
  async statisticInvoice(@External() { oid }: TExternal, @Query() query: StatisticTimeQuery) {
    return await this.apiStatisticInvoiceService.statisticInvoice(oid, query)
  }

  @Get('statistic-visit')
  @HasPermission(PermissionId.STATISTIC_VISIT)
  async statisticVisit(@External() { oid }: TExternal, @Query() query: StatisticTimeQuery) {
    return await this.apiStatisticVisitService.statisticVisit(oid, query)
  }
}
