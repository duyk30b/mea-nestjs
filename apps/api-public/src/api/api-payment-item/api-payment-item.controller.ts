import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiPaymentItemService } from './api-payment-item.service'
import { PaymentItemGetManyQuery, PaymentItemPaginationQuery } from './request'

@ApiTags('PaymentItem')
@ApiBearerAuth('access-token')
@Controller('payment-item')
export class ApiPaymentItemController {
  constructor(private readonly apiPaymentItemService: ApiPaymentItemService) { }

  @Get('pagination')
  @UserPermission() // tạm thời để thế này trước
  pagination(@External() { oid }: TExternal, @Query() query: PaymentItemPaginationQuery) {
    return this.apiPaymentItemService.pagination(oid, query)
  }

  @Get('list')
  @UserPermission() // tạm thời để thế này trước
  async list(@External() { oid }: TExternal, @Query() query: PaymentItemGetManyQuery) {
    return await this.apiPaymentItemService.getMany(oid, query)
  }
}
