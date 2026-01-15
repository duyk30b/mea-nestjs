import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { GenerateIdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiPrescriptionSampleService } from './api-prescription-sample.service'
import {
  PrescriptionSampleCreateBody,
  PrescriptionSampleGetManyQuery,
  PrescriptionSamplePaginationQuery,
  PrescriptionSampleUpdateBody,
} from './request'

@ApiTags('PrescriptionSample')
@ApiBearerAuth('access-token')
@Controller('prescription-sample')
export class ApiPrescriptionSampleController {
  constructor(private readonly apiPrescriptionSampleService: ApiPrescriptionSampleService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: PrescriptionSamplePaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPrescriptionSampleService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: PrescriptionSampleGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPrescriptionSampleService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async findOne(@External() { oid }: TExternal, @Param() { id }: GenerateIdParam): Promise<BaseResponse> {
    const data = await this.apiPrescriptionSampleService.getOne(oid, id)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_PRESCRIPTION_SAMPLE)
  async createOne(
    @External() { oid }: TExternal,
    @Body() body: PrescriptionSampleCreateBody
  ): Promise<BaseResponse> {
    const data = await this.apiPrescriptionSampleService.createOne(oid, body)
    return { data }
  }

  @Post('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_PRESCRIPTION_SAMPLE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: PrescriptionSampleUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiPrescriptionSampleService.updateOne(oid, id, body)
    return { data }
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_PRESCRIPTION_SAMPLE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
    const data = await this.apiPrescriptionSampleService.destroyOne(oid, id)
    return { data }
  }
}
