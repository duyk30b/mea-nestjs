import { Controller, Delete, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiAppointmentService } from './api-appointment.service'
import {
  AppointmentGetManyQuery,
  AppointmentGetOneQuery,
  AppointmentPaginationQuery,
} from './request'

@ApiTags('Appointment')
@ApiBearerAuth('access-token')
@Controller('appointment')
export class ApiAppointmentController {
  constructor(
    private readonly apiAppointmentService: ApiAppointmentService
  ) { }

  @Get('pagination')
  @HasPermission(PermissionId.CUSTOMER_READ)
  pagination(@External() { oid }: TExternal, @Query() query: AppointmentPaginationQuery) {
    return this.apiAppointmentService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.CUSTOMER_READ)
  list(@External() { oid }: TExternal, @Query() query: AppointmentGetManyQuery) {
    return this.apiAppointmentService.getMany(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.CUSTOMER_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: AppointmentGetOneQuery
  ) {
    return await this.apiAppointmentService.getOne(oid, id, query)
  }

  @Delete('delete/:id')
  @HasPermission(PermissionId.CUSTOMER_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiAppointmentService.deleteOne(oid, id)
  }
}
