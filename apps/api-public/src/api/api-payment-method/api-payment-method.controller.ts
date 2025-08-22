import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
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
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: PaymentMethodPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPaymentMethodService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: PaymentMethodGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPaymentMethodService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async findOne(@External() { oid }: TExternal, @Param() { id }: IdParam): Promise<BaseResponse> {
    const data = await this.apiPaymentMethodService.getOne(oid, id)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_PAYMENT_METHOD)
  async createOne(
    @External() { oid }: TExternal,
    @Body() body: PaymentMethodCreateBody
  ): Promise<BaseResponse> {
    const data = await this.apiPaymentMethodService.createOne(oid, body)
    return { data }
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_PAYMENT_METHOD)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: PaymentMethodUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiPaymentMethodService.updateOne({ oid, paymentMethodId: id, body })
    return { data }
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_PAYMENT_METHOD)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.apiPaymentMethodService.destroyOne({ oid, paymentMethodId: id })
    return { data }
  }
}
