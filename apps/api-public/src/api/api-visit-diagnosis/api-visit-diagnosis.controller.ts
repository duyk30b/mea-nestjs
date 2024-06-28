import { Body, Controller, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { FastifyFilesInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiVisitDiagnosisService } from './api-visit-diagnosis.service'
import { VisitDiagnosisUpdateBody } from './request'

@ApiTags('VisitDiagnosis')
@ApiBearerAuth('access-token')
@Controller('visit-diagnosis')
export class ApiVisitDiagnosisController {
  constructor(private readonly apiVisitDiagnosisService: ApiVisitDiagnosisService) {}

  @Post('update/:id')
  @HasPermission(PermissionId.VISIT_DIAGNOSIS)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async update(
    @External() { oid }: TExternal,
    @UploadedFiles() files: FileUploadDto[],
    @Param() { id }: IdParam,
    @Body() body: VisitDiagnosisUpdateBody
  ) {
    return await this.apiVisitDiagnosisService.updateOne({ oid, body, files, id })
  }
}
