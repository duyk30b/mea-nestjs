import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { LimitQuery } from '../../../../_libs/common/dto/query'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiStatisticService } from './api-statistic.service'
import {
    StatisticMonthQuery,
    StatisticTimeQuery,
    StatisticTopBestSellingQuery,
    StatisticTopCustomerBestInvoiceQuery,
} from './request'

@ApiTags('Statistic')
@ApiBearerAuth('access-token')
@Controller('statistic')
export class ApiStatisticController {
    constructor(private readonly apiStatisticService: ApiStatisticService) {}

    @Get('sum-warehouse')
    async sumWarehouse(@External() { oid }: TExternal) {
        return await this.apiStatisticService.sumWarehouse(oid)
    }

    @Get('top-product-best-selling')
    async topProductBestSelling(@External() { oid }: TExternal, @Query() query: StatisticTopBestSellingQuery) {
        return await this.apiStatisticService.topProductBestSelling(oid, query)
    }

    @Get('top-product-high-cost-money')
    async topProductHighCostMoney(@External() { oid }: TExternal, @Query() query: LimitQuery) {
        return await this.apiStatisticService.topProductHighCostMoney(oid, query)
    }

    @Get('top-procedure-best-selling')
    async topProcedureHighActualMoney(@External() { oid }: TExternal, @Query() query: StatisticTopBestSellingQuery) {
        return await this.apiStatisticService.topProcedureBestSelling(oid, query)
    }

    @Get('top-customer-best-invoice')
    async topCustomerBestInvoice(@External() { oid }: TExternal, @Query() query: StatisticTopCustomerBestInvoiceQuery) {
        return await this.apiStatisticService.topCustomerBestInvoice(oid, query)
    }

    @Get('sum-debt')
    sumDebt(@External() { oid }: TExternal) {
        return this.apiStatisticService.sumDebt(oid)
    }

    @Get('sum-money-order')
    async sumMoneyOrder(@External() { oid }: TExternal, @Query() query: StatisticTimeQuery) {
        return await this.apiStatisticService.sumMoneyOrder(oid, query)
    }

    @Get('sum-money-invoice')
    async sumMoneyInvoice(@External() { oid }: TExternal, @Query() query: StatisticTimeQuery) {
        return await this.apiStatisticService.sumMoneyInvoice(oid, query)
    }

    @Get('sum-money-receipt')
    async sumMoneyReceipt(@External() { oid }: TExternal, @Query() query: StatisticTimeQuery) {
        return await this.apiStatisticService.sumMoneyReceipt(oid, query)
    }

    @Get('sum-invoice-surcharge-and-expense')
    async sumInvoiceSurcharge(@External() { oid }: TExternal, @Query() query: StatisticTimeQuery) {
        return await this.apiStatisticService.sumInvoiceSurchargeAndExpenses(oid, query)
    }

    @Get('revenue-month')
    async revenueMonth(@External() { oid }: TExternal, @Query() query: StatisticMonthQuery) {
        return await this.apiStatisticService.revenueMonth(oid, query.year, query.month)
    }
}
