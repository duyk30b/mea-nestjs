import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiAppointmentService } from './api-appointment.service'
import {
  AppointmentCreateBody,
  AppointmentGetManyQuery,
  AppointmentGetOneQuery,
  AppointmentPaginationQuery,
  AppointmentRegisterTicketClinicBody,
  AppointmentUpdateBody,
} from './request'

@ApiTags('Appointment')
@ApiBearerAuth('access-token')
@Controller('appointment')
export class ApiAppointmentController {
  constructor(private readonly apiAppointmentService: ApiAppointmentService) { }

  @Get('pagination')
  @HasPermission(PermissionId.APPOINTMENT_READ)
  pagination(@External() { oid }: TExternal, @Query() query: AppointmentPaginationQuery) {
    return this.apiAppointmentService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.APPOINTMENT_READ)
  list(@External() { oid }: TExternal, @Query() query: AppointmentGetManyQuery) {
    return this.apiAppointmentService.getMany(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.APPOINTMENT_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: AppointmentGetOneQuery
  ) {
    return await this.apiAppointmentService.getOne(oid, id, query)
  }

  @Post('create')
  @HasPermission(PermissionId.APPOINTMENT_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: AppointmentCreateBody) {
    return await this.apiAppointmentService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.APPOINTMENT_UPDATE)
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: AppointmentUpdateBody
  ) {
    return await this.apiAppointmentService.updateOne(oid, +id, body)
  }

  @Delete('delete/:id')
  @HasPermission(PermissionId.APPOINTMENT_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiAppointmentService.deleteOne(oid, id)
  }

  @Post(':id/register-ticket-clinic')
  @HasPermission(PermissionId.APPOINTMENT_REGISTER_TICKET)
  async registerTicketClinic(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: AppointmentRegisterTicketClinicBody
  ) {
    return await this.apiAppointmentService.registerTicketClinic({
      oid,
      appointmentId: id,
      body,
    })
  }
}
