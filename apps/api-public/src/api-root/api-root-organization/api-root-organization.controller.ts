import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { IsRoot } from '../../../../_libs/common/guards/root.guard'
import { ApiRootOrganizationService } from './api-root-organization.service'
import {
  RootOrganizationClearBody,
  RootOrganizationCreateBody,
  RootOrganizationPaginationQuery,
  RootOrganizationUpdateBody,
} from './request'

@ApiTags('Root')
@ApiBearerAuth('access-token')
@IsRoot() // ===== Controller dành riêng cho ROOT =====
@Controller('root')
export class ApiRootOrganizationController {
  constructor(private readonly apiRootOrganizationService: ApiRootOrganizationService) { }

  @Get('organization/pagination')
  pagination(@Query() query: RootOrganizationPaginationQuery) {
    return this.apiRootOrganizationService.pagination(query)
  }

  @Post('organization/create')
  async createOne(@Body() body: RootOrganizationCreateBody) {
    return await this.apiRootOrganizationService.createOne(body)
  }

  @Patch('organization/update/:id')
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(@Param() { id }: IdParam, @Body() body: RootOrganizationUpdateBody) {
    return await this.apiRootOrganizationService.updateOne(id, body)
  }

  @Put('organization/clear/:id')
  @ApiParam({ name: 'id', example: 1 })
  async clearOne(@Param() { id }: IdParam, @Body() body: RootOrganizationClearBody) {
    return await this.apiRootOrganizationService.clearOne(id, body)
  }
}
