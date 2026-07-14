import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { StatisticCustomerService } from './statistic-customer.service'

@ApiTags('Statistic')
@ApiBearerAuth('access-token')
@Controller('statistic/customer')
export class StatisticCustomerController {
  constructor(private readonly statisticProcedureService: StatisticCustomerService) { }

  @Get('sum-customer-debt')
  @UserPermission(PermissionId.STATISTIC_CUSTOMER)
  async sumCustomerDebt(@External() { oid }: TExternal): Promise<BaseResponse> {
    const data = await this.statisticProcedureService.sumCustomerDebt(oid)
    return { data }
  }
}
