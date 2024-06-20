import { Body, Controller, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiVisitDiagnosisService } from './api-visit-diagnosis.service'
import { CreateVisitDiagnosisBody } from './request'

@ApiTags('VisitDiagnosis')
@ApiBearerAuth('access-token')
@Controller('visit-diagnosis')
export class ApiVisitDiagnosisController {
  constructor(private readonly apiVisitDiagnosisService: ApiVisitDiagnosisService) {}

  @Post('create')
  async createOne(@External() { oid }: TExternal, @Body() body: CreateVisitDiagnosisBody) {
    return await this.apiVisitDiagnosisService.createOne(oid, body)
  }
}
