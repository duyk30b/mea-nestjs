import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { FastifyFilesInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiTicketClinicService } from './api-ticket-clinic.service'
import { TicketClinicUpdateDiagnosisBody } from './request/ticket-clinic-update-diagnosis.body'

@ApiTags('TicketClinic')
@ApiBearerAuth('access-token')
@Controller('ticket-clinic')
export class ApiTicketClinicController {
  constructor(
    private readonly apiTicketClinicService: ApiTicketClinicService
  ) { }

  @Post(':id/start-checkup')
  @UserPermission(PermissionId.TICKET_CLINIC_START_CHECKUP)
  async startCheckup(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiTicketClinicService.startCheckup({ oid, ticketId: id })
  }

  @Post(':id/update-diagnosis')
  @UserPermission(PermissionId.TICKET_CLINIC_UPDATE_TICKET_ATTRIBUTE)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async updateDiagnosisBasic(
    @External() { oid }: TExternal,
    @UploadedFiles() files: FileUploadDto[],
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateDiagnosisBody
  ) {
    return await this.apiTicketClinicService.updateDiagnosis({
      oid,
      ticketId: id,
      body,
      files,
    })
  }
}
