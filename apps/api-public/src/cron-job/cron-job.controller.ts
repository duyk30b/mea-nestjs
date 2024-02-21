import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IsRoot } from '../guards/root.guard'
import { ProductBatchJob } from './product-batch.job'

@Controller('cron-job')
@ApiTags('Cron-Job')
@ApiBearerAuth('access-token')
export class CronJobController {
  constructor(private readonly productBatchJob: ProductBatchJob) {}

  @Get('deleteBatchZeroQuantityAll')
  @IsRoot() // ===== Controller dành riêng cho ROOT =====
  async deleteBatchZeroQuantityAll() {
    this.productBatchJob.deleteBatchZeroQuantityAll()
  }
}
