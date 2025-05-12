import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { GoogleDriverModule } from '../../../_libs/transporter/google-driver/google-driver.module'
import { CronJobController } from './cron-job.controller'
import { PostgresqlJob } from './postgresql.job'

@Module({
  imports: [ScheduleModule.forRoot(), GoogleDriverModule],
  controllers: [CronJobController],
  providers: [PostgresqlJob],
})
export class CronJobModule { }
