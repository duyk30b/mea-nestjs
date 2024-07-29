import { Controller } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

@ApiTags('TicketDiagnosis')
@ApiBearerAuth('access-token')
@Controller('ticket-diagnosis')
export class ApiTicketDiagnosisController {
  constructor() { }
}
