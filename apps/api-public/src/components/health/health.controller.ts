import { Controller, Get } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ApiTags } from '@nestjs/swagger'
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly db: TypeOrmHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  @Cron(CronExpression.EVERY_MINUTE)
  check() {
    const pathStorage = process.platform === 'win32' ? 'C:\\' : '/'
    const thresholdPercent = process.platform === 'win32' ? 0.99 : 0.5

    return this.health.check([
      // () => this.http.pingCheck('nestjs-docs', 'https://api.mea.vn/document'),
      () => this.db.pingCheck('database'),
      // () => this.disk.checkStorage('storage', { path: pathStorage, thresholdPercent }),
      // () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      // () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
    ])
  }
}
