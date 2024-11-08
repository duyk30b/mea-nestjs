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
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { FastifyFilesInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiTicketClinicService } from './api-ticket-clinic.service'
import {
  TicketClinicUpdateDiagnosisBasicBody,
  TicketClinicUpdateDiagnosisSpecialBody,
} from './request'

@ApiTags('TicketEye')
@ApiBearerAuth('access-token')
@Controller('ticket-eye')
export class ApiTicketEyeController {
  constructor(
    private readonly apiTicketClinicService: ApiTicketClinicService
  ) { }

  @Post(':id/update-diagnosis-basic')
  @HasPermission(PermissionId.TICKET_CLINIC_EYE_UPDATE_DIAGNOSIS_BASIC)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async updateDiagnosis(
    @External() { oid }: TExternal,
    @UploadedFiles() files: FileUploadDto[],
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateDiagnosisBasicBody
  ) {
    return await this.apiTicketClinicService.updateDiagnosisBasic({
      oid,
      ticketId: id,
      body,
      files,
    })
  }

  @Post(':id/update-diagnosis-special')
  @HasPermission(PermissionId.TICKET_CLINIC_EYE_UPDATE_DIAGNOSIS_SPECIAL)
  async updateDiagnosisSpecial(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketClinicUpdateDiagnosisSpecialBody
  ) {
    return await this.apiTicketClinicService.updateDiagnosisSpecial({
      oid,
      ticketId: id,
      body,
    })
  }
}
