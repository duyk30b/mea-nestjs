import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiStatisticLaboratoryService } from './api-statistic-laboratory.service'
import { ApiStatisticRadiologyService } from './api-statistic-radiology.service'
import { ApiStatisticTicketService } from './api-statistic-ticket.service'
import { ApiStatisticService } from './api-statistic.service'
import {
  StatisticProductHighMoneyQuery,
  StatisticTicketQuery,
  StatisticTimeQuery,
  StatisticTopBestSellingQuery,
  StatisticTopCustomerBestTicketQuery,
} from './request'

@ApiTags('Statistic')
@ApiBearerAuth('access-token')
@Controller('statistic')
export class ApiStatisticController {
  constructor(
    private readonly apiStatisticService: ApiStatisticService,
    private readonly apiStatisticTicketService: ApiStatisticTicketService,
    private readonly apiStatisticLaboratoryService: ApiStatisticLaboratoryService,
    private readonly apiStatisticRadiologyService: ApiStatisticRadiologyService
  ) { }

  @Get('sum-warehouse')
  @UserPermission(PermissionId.STATISTIC_PRODUCT)
  async sumWarehouse(@External() { oid }: TExternal) {
    return await this.apiStatisticService.sumWarehouse(oid)
  }

  @Get('top-product-best-selling')
  @UserPermission(PermissionId.STATISTIC_PRODUCT)
  async topProductBestSelling(
    @External() { oid }: TExternal,
    @Query() query: StatisticTopBestSellingQuery
  ) {
    return await this.apiStatisticService.topProductBestSelling(oid, query)
  }

  @Get('top-product-high-money')
  @UserPermission(PermissionId.STATISTIC_PRODUCT)
  async topProductHighSumRetailMoney(
    @External() { oid }: TExternal,
    @Query() query: StatisticProductHighMoneyQuery
  ) {
    return await this.apiStatisticService.topProductHighMoney(oid, query)
  }

  @Get('top-procedure-best-selling')
  @UserPermission(PermissionId.STATISTIC_PROCEDURE)
  async topProcedureBestSelling(
    @External() { oid }: TExternal,
    @Query() query: StatisticTopBestSellingQuery
  ) {
    return await this.apiStatisticService.topProcedureBestSelling(oid, query)
  }

  @Get('top-customer-best-ticket')
  @UserPermission(PermissionId.STATISTIC_CUSTOMER)
  async topCustomerBestTicket(
    @External() { oid }: TExternal,
    @Query() query: StatisticTopCustomerBestTicketQuery
  ) {
    return await this.apiStatisticService.topCustomerBestTicket(oid, query)
  }

  @Get('sum-customer-debt')
  @UserPermission(PermissionId.STATISTIC_CUSTOMER)
  sumCustomerDebt(@External() { oid }: TExternal) {
    return this.apiStatisticService.sumCustomerDebt(oid)
  }

  @Get('statistic-ticket')
  @UserPermission(PermissionId.STATISTIC_TICKET)
  async statisticTicket(@External() { oid }: TExternal, @Query() query: StatisticTicketQuery) {
    return await this.apiStatisticTicketService.statisticTicket(oid, query)
  }

  @Get('ticket-laboratory/sum-money')
  @UserPermission(PermissionId.STATISTIC_LABORATORY)
  async sumMoneyTicketLaboratory(
    @External() { oid }: TExternal,
    @Query() query: StatisticTimeQuery
  ) {
    return await this.apiStatisticLaboratoryService.sumMoney(oid, query)
  }

  @Get('ticket-radiology/sum-money')
  @UserPermission(PermissionId.STATISTIC_RADIOLOGY)
  async sumMoneyTicketRadiology(
    @External() { oid }: TExternal,
    @Query() query: StatisticTimeQuery
  ) {
    return await this.apiStatisticRadiologyService.sumMoney(oid, query)
  }
}
