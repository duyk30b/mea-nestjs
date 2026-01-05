import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { IsRoot } from '../../../../_libs/common/guards/root.guard'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { ApiRootOrganizationService } from './api-root-organization.service'
import {
  RootOrganizationClearBody,
  RootOrganizationCreateBody,
  RootOrganizationPaginationQuery,
  RootOrganizationPaymentMoneyBody,
  RootOrganizationUpdateBody,
} from './request'

@ApiTags('Root')
@ApiBearerAuth('access-token')
@IsRoot() // ===== Controller dành riêng cho ROOT =====
@Controller('root')
export class ApiRootOrganizationController {
  constructor(private readonly apiRootOrganizationService: ApiRootOrganizationService) { }

  @Get('organization/pagination')
  async pagination(@Query() query: RootOrganizationPaginationQuery): Promise<BaseResponse> {
    const data = await this.apiRootOrganizationService.pagination(query)
    return { data }
  }

  @Post('organization/create')
  async createOne(@Body() body: RootOrganizationCreateBody): Promise<BaseResponse> {
    const data = await this.apiRootOrganizationService.createOne(body)
    return { data }
  }

  @Post('organization/update/:id')
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @Param() { id }: IdParam,
    @Body() body: RootOrganizationUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiRootOrganizationService.updateOne(id, body)
    return { data }
  }

  @Post('organization/payment-money/:id')
  @ApiParam({ name: 'id', example: 1 })
  async paymentMoney(
    @Param() { id }: IdParam,
    @Body() body: RootOrganizationPaymentMoneyBody
  ): Promise<BaseResponse> {
    const data = await this.apiRootOrganizationService.paymentMoney(id, body)
    return { data }
  }

  @Post('organization/clear/:id')
  @ApiParam({ name: 'id', example: 1 })
  async clearOne(
    @Param() { id }: IdParam,
    @Body() body: RootOrganizationClearBody
  ): Promise<BaseResponse> {
    const data = await this.apiRootOrganizationService.clearOne(id, body)
    return { data }
  }
}
