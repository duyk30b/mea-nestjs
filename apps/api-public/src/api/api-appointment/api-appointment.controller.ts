import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { GenerateIdParam } from '../../../../_libs/common/dto/param'
import { OrganizationPermission } from '../../../../_libs/common/guards/organization.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
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
  @OrganizationPermission(PermissionId.APPOINTMENT)
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: AppointmentPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiAppointmentService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @OrganizationPermission(PermissionId.APPOINTMENT)
  async list(
    @External() { oid }: TExternal,
    @Query() query: AppointmentGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiAppointmentService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @OrganizationPermission(PermissionId.APPOINTMENT)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Query() query: AppointmentGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiAppointmentService.getOne({ oid, id, query })
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.APPOINTMENT_CREATE)
  async create(
    @External() { oid }: TExternal,
    @Body() body: AppointmentCreateBody
  ): Promise<BaseResponse> {
    const data = await this.apiAppointmentService.createOne(oid, body)
    return { data }
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.APPOINTMENT_UPDATE)
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: AppointmentUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiAppointmentService.updateOne(oid, id, body)
    return { data }
  }

  @Delete('delete/:id')
  @UserPermission(PermissionId.APPOINTMENT_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: GenerateIdParam): Promise<BaseResponse> {
    const data = await this.apiAppointmentService.deleteOne(oid, id)
    return { data }
  }

  @Post(':id/register-ticket-clinic')
  @UserPermission(PermissionId.APPOINTMENT_REGISTER_TICKET)
  async registerTicketClinic(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: AppointmentRegisterTicketClinicBody
  ): Promise<BaseResponse> {
    const data = await this.apiAppointmentService.registerTicketClinic({
      oid,
      appointmentId: id,
      body,
    })
    return { data }
  }
}
