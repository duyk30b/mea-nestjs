import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { StatisticTicketProcedureQuery } from './request'
import { StatisticProcedureService } from './statistic-procedure.service'

@ApiTags('Statistic')
@ApiBearerAuth('access-token')
@Controller('statistic/procedure')
export class StatisticProcedureController {
  constructor(private readonly statisticProcedureService: StatisticProcedureService) { }

  @Get('statistic-ticket-procedure')
  @UserPermission(PermissionId.STATISTIC_PROCEDURE)
  async statisticTicketProcedure(
    @External() { oid }: TExternal,
    @Query() query: StatisticTicketProcedureQuery
  ): Promise<BaseResponse> {
    const data = await this.statisticProcedureService.statisticTicketProcedure(oid, query)
    return { data }
  }
}
