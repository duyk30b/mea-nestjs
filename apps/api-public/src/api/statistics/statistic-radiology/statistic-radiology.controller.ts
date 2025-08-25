import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { StatisticTicketRadiologyQuery } from './request'
import { StatisticRadiologyService } from './statistic-radiology.service'

@ApiTags('Statistic')
@ApiBearerAuth('access-token')
@Controller('statistic/radiology')
export class StatisticRadiologyController {
  constructor(private readonly statisticRadiologyService: StatisticRadiologyService) { }

  @Get('statistic-ticket-radiology')
  @UserPermission(PermissionId.STATISTIC_RADIOLOGY)
  async statisticTicketRadiology(
    @External() { oid }: TExternal,
    @Query() query: StatisticTicketRadiologyQuery
  ): Promise<BaseResponse> {
    const data = await this.statisticRadiologyService.statisticTicketRadiology(oid, query)
    return { data }
  }
}
