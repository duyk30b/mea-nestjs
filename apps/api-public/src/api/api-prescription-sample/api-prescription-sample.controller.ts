import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
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
  @IsUser()
  pagination(@External() { oid }: TExternal, @Query() query: PrescriptionSamplePaginationQuery) {
    return this.apiPrescriptionSampleService.pagination(oid, query)
  }

  @Get('list')
  @IsUser()
  list(@External() { oid }: TExternal, @Query() query: PrescriptionSampleGetManyQuery) {
    return this.apiPrescriptionSampleService.getMany(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiPrescriptionSampleService.getOne(oid, id)
  }

  @Post('create')
  @HasPermission(PermissionId.MASTER_DATA_PRESCRIPTION_SAMPLE)
  async createOne(@External() { oid }: TExternal, @Body() body: PrescriptionSampleCreateBody) {
    return await this.apiPrescriptionSampleService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.MASTER_DATA_PRESCRIPTION_SAMPLE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: PrescriptionSampleUpdateBody
  ) {
    return await this.apiPrescriptionSampleService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.MASTER_DATA_PRESCRIPTION_SAMPLE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiPrescriptionSampleService.destroyOne(oid, id)
  }
}
