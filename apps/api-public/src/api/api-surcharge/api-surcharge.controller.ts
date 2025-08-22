import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiSurchargeService } from './api-surcharge.service'
import {
  SurchargeCreateBody,
  SurchargeGetManyQuery,
  SurchargePaginationQuery,
  SurchargeUpdateBody,
} from './request'

@ApiTags('Surcharge')
@ApiBearerAuth('access-token')
@Controller('surcharge')
export class ApiSurchargeController {
  constructor(private readonly apiSurchargeService: ApiSurchargeService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: SurchargePaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiSurchargeService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: SurchargeGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiSurchargeService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    const data = await this.apiSurchargeService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_SURCHARGE)
  async createOne(
    @External() { oid }: TExternal,
    @Body() body: SurchargeCreateBody
  ): Promise<BaseResponse> {
    const data = await this.apiSurchargeService.createOne(oid, body)
    return { data }
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_SURCHARGE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: SurchargeUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiSurchargeService.updateOne({ oid, surchargeId: id, body })
    return { data }
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_SURCHARGE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.apiSurchargeService.destroyOne({ oid, surchargeId: id })
    return { data }
  }
}
