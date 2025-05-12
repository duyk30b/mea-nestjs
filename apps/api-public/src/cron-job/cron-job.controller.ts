import { Controller, Get, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IsRoot } from '../../../_libs/common/guards/root.guard'
import { PostgresqlJob } from './postgresql.job'

@Controller('cron-job')
@ApiTags('Cron-Job')
@ApiBearerAuth('access-token')
export class CronJobController {
  constructor(private readonly postgresqlJob: PostgresqlJob) {}

  @Post('job-backup-postgres')
  @IsRoot() // ===== Controller dành riêng cho ROOT =====
  async startJobBackupPostgres() {
    await this.postgresqlJob.startBackupPostgres()
    return await this.postgresqlJob.startJobUploadPostgres()
  }
}
