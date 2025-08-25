import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
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
