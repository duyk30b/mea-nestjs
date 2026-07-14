import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
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
