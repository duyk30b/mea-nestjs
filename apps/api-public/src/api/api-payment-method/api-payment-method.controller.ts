import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
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
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: PaymentMethodPaginationQuery) {
    return this.apiPaymentMethodService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  list(@External() { oid }: TExternal, @Query() query: PaymentMethodGetManyQuery) {
    return this.apiPaymentMethodService.getMany(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiPaymentMethodService.getOne(oid, id)
  }

  @Post('create')
  @HasPermission(PermissionId.MASTER_DATA_PAYMENT_METHOD)
  async createOne(@External() { oid }: TExternal, @Body() body: PaymentMethodCreateBody) {
    return await this.apiPaymentMethodService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.MASTER_DATA_PAYMENT_METHOD)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: PaymentMethodUpdateBody
  ) {
    return await this.apiPaymentMethodService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.MASTER_DATA_PAYMENT_METHOD)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiPaymentMethodService.destroyOne({ oid, paymentMethodId: id })
  }
}
