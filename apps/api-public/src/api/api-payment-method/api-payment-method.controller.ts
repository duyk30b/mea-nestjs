import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiPaymentMethodService } from './api-payment-method.service'
import {
  PaymentMethodCreateBody,
  PaymentMethodGetManyQuery,
  PaymentMethodPaginationQuery,
  PaymentMethodUpdateBody,
} from './request'

@ApiTags('PaymentMethod')
@ApiBearerAuth('access-token')
@Controller('payment-method')
export class ApiPaymentMethodController {
  constructor(private readonly apiPaymentMethodService: ApiPaymentMethodService) { }

  @Get('pagination')
  @UserPermission()
  pagination(@External() { oid }: TExternal, @Query() query: PaymentMethodPaginationQuery) {
    return this.apiPaymentMethodService.pagination(oid, query)
  }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: PaymentMethodGetManyQuery) {
    return this.apiPaymentMethodService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiPaymentMethodService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_PAYMENT_METHOD)
  async createOne(@External() { oid }: TExternal, @Body() body: PaymentMethodCreateBody) {
    return await this.apiPaymentMethodService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_PAYMENT_METHOD)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: PaymentMethodUpdateBody
  ) {
    return await this.apiPaymentMethodService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_PAYMENT_METHOD)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiPaymentMethodService.destroyOne({ oid, paymentMethodId: id })
  }
}
