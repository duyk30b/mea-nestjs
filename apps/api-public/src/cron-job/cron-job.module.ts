import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { CronJobController } from './cron-job.controller'
import { ProductBatchJob } from './product-batch.job'

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [CronJobController],
  providers: [ProductBatchJob],
})
export class CronJobModule {}
