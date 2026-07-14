import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { StatisticTicketQuery } from './request'
import { StatisticTicketQueryTime } from './request/statistic-ticket-query-time'
import { StatisticTicketService } from './statistic-ticket.service'

@ApiTags('Statistic')
@ApiBearerAuth('access-token')
@Controller('statistic/ticket')
export class StatisticTicketController {
  constructor(private readonly statisticTicketService: StatisticTicketService) { }

  @Get('group_by_customer')
  @UserPermission(PermissionId.STATISTIC_CUSTOMER)
  async groupByCustomer(
    @External() { oid }: TExternal,
    @Query() query: StatisticTicketQuery
  ): Promise<BaseResponse> {
    const data = await this.statisticTicketService.groupByCustomer(oid, query)
    return { data }
  }

  @Get('group_by_customer_group')
  @UserPermission(PermissionId.STATISTIC_CUSTOMER)
  async groupByCustomerGroup(
    @External() { oid }: TExternal,
    @Query() query: StatisticTicketQuery
  ): Promise<BaseResponse> {
    const data = await this.statisticTicketService.groupByCustomerGroup(oid, query)
    return { data }
  }

  @Get('group_by_time')
  @UserPermission(PermissionId.STATISTIC_CUSTOMER)
  async groupByTime(
    @External() { oid }: TExternal,
    @Query() query: StatisticTicketQueryTime
  ): Promise<BaseResponse> {
    const data = await this.statisticTicketService.groupByTime(oid, query)
    return { data }
  }
}
