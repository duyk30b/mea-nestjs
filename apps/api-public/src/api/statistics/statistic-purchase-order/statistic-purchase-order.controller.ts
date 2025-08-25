import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { StatisticTimeQuery } from '../request'
import { StatisticPurchaseOrderService } from './statistic-purchase-order.service'

@ApiTags('Statistic')
@ApiBearerAuth('access-token')
@Controller('statistic/purchase-order')
export class StatisticPurchaseOrderController {
  constructor(private readonly statisticPurchaseOrderService: StatisticPurchaseOrderService) { }

  @Get('statistic')
  @UserPermission(PermissionId.STATISTIC_PURCHASE_ORDER)
  async statisticPurchaseOrder(
    @External() { oid }: TExternal,
    @Query() query: StatisticTimeQuery
  ): Promise<BaseResponse> {
    const data = await this.statisticPurchaseOrderService.statisticPurchaseOrder(oid, query)
    return { data }
  }
}
