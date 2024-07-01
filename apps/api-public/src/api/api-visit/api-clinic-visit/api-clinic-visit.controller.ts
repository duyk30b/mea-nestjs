import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { HasPermission } from '../../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/database/entities/permission.entity'
import { ApiClinicVisitService } from './api-clinic-visit.service'
import {
  ClinicVisitRegisterWithExistCustomerBody,
  ClinicVisitRegisterWithNewCustomerBody,
} from './request/clinic-visit-register.body'

@ApiTags('ClinicVisit')
@ApiBearerAuth('access-token')
@Controller('clinic-visit')
export class ApiClinicVisitController {
  constructor(private readonly apiClinicVisitService: ApiClinicVisitService) {}

  @Post('register-with-new-customer')
  @HasPermission(PermissionId.VISIT_CREATE)
  async registerWithNewUser(
    @External() { oid }: TExternal,
    @Body() body: ClinicVisitRegisterWithNewCustomerBody
  ) {
    return await this.apiClinicVisitService.registerWithNewUser(oid, body)
  }

  @Post('register-with-exist-customer')
  @HasPermission(PermissionId.VISIT_CREATE)
  async registerWithExistUser(
    @External() { oid }: TExternal,
    @Body() body: ClinicVisitRegisterWithExistCustomerBody
  ) {
    return await this.apiClinicVisitService.registerWithExistUser(oid, body)
  }

  @Post('start-checkup/:id')
  @HasPermission(PermissionId.VISIT_START_CHECKUP)
  async startCheckup(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiClinicVisitService.startCheckup(oid, id)
  }
}
