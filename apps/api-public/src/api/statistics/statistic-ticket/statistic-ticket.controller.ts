import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { StatisticTicketQuery } from './request'
import { StatisticTicketQueryTime } from './request/statistic-ticket-query'
import { StatisticTicketService } from './statistic-ticket.service'

@ApiTags('Statistic')
@ApiBearerAuth('access-token')
@Controller('statistic/ticket')
export class StatisticTicketController {
  constructor(private readonly statisticTicketService: StatisticTicketService) { }

  @Get('group-by-customer')
  @UserPermission(PermissionId.STATISTIC_CUSTOMER)
  async groupByCustomer(
    @External() { oid }: TExternal,
    @Query() query: StatisticTicketQuery
  ): Promise<BaseResponse> {
    const data = await this.statisticTicketService.groupByCustomer(oid, query)
    return { data }
  }

  @Get('statistic')
  @UserPermission(PermissionId.STATISTIC_TICKET)
  async statistic(
    @External() { oid }: TExternal,
    @Query() query: StatisticTicketQueryTime
  ): Promise<BaseResponse> {
    const data = await this.statisticTicketService.statistic(oid, query)
    return { data }
  }
}
