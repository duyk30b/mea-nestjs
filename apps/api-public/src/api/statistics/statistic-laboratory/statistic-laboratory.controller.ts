import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { StatisticTicketLaboratoryQuery } from './request'
import { StatisticLaboratoryService } from './statistic-laboratory.service'

@ApiTags('Statistic')
@ApiBearerAuth('access-token')
@Controller('statistic/laboratory')
export class StatisticLaboratoryController {
  constructor(private readonly statisticLaboratoryService: StatisticLaboratoryService) { }

  @Get('statistic-ticket-laboratory')
  @UserPermission(PermissionId.STATISTIC_LABORATORY)
  async statisticTicketLaboratory(
    @External() { oid }: TExternal,
    @Query() query: StatisticTicketLaboratoryQuery
  ): Promise<BaseResponse> {
    const data = await this.statisticLaboratoryService.statisticTicketLaboratory(oid, query)
    return { data }
  }
}
