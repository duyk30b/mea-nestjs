import { Injectable, Logger } from '@nestjs/common'
import { Cron, Interval } from '@nestjs/schedule'
import { DEMO_JOB_CONSTANT } from './demo.job.constant'

@Injectable()
export class DemoCronJobService {
  private readonly logger = new Logger(DemoCronJobService.name)

  @Cron(DEMO_JOB_CONSTANT.TIME, { utcOffset: 7 }) // chạy vào 0h30 sáng hàng ngày
  async demo(): Promise<any> {
    this.logger.log('Demo Cron Job')
  }

  @Interval(2000)
  async interval(): Promise<any> {
    this.logger.log('Interval: ' + new Date().toISOString())
  }
}
