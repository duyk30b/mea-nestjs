import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { StatisticProductHighMoneyQuery } from './request'
import { StatisticTicketProductQuery } from './request/statistic-ticket-product.query'
import { StatisticProductService } from './statistic-product.service'

@ApiTags('Statistic')
@ApiBearerAuth('access-token')
@Controller('statistic/product')
export class StatisticProductController {
  constructor(private readonly statisticProductService: StatisticProductService) { }

  @Get('sum-warehouse')
  @UserPermission(PermissionId.STATISTIC_PRODUCT)
  async sumWarehouse(@External() { oid }: TExternal): Promise<BaseResponse> {
    const data = await this.statisticProductService.sumWarehouse(oid)
    return { data }
  }

  @Get('top-product-high-money')
  @UserPermission(PermissionId.STATISTIC_PRODUCT)
  async topProductHighSumRetailMoney(
    @External() { oid }: TExternal,
    @Query() query: StatisticProductHighMoneyQuery
  ) {
    const data = await this.statisticProductService.topProductHighMoney(oid, query)
    return { data }
  }

  @Get('statistic-ticket-product')
  @UserPermission(PermissionId.STATISTIC_PRODUCT)
  async statisticTicketProduct(
    @External() { oid }: TExternal,
    @Query() query: StatisticTicketProductQuery
  ): Promise<BaseResponse> {
    const data = await this.statisticProductService.statisticTicketProduct(oid, query)
    return { data }
  }
}
