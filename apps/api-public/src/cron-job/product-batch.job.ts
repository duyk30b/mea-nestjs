import { Injectable, Logger } from '@nestjs/common'
import { Cron, Interval } from '@nestjs/schedule'
import {
  ProductBatchRepository,
  ProductMovementRepository,
} from '../../../_libs/database/repository'

@Injectable()
export class ProductBatchJob {
  private readonly logger = new Logger(ProductBatchJob.name)

  constructor(
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly productMovementRepository: ProductMovementRepository
  ) {}

  @Cron('0 30 3 * * *', { utcOffset: 7 }) // chạy vào 3h30 sáng hàng ngày
  async deleteBatchZeroQuantity(): Promise<any> {
    this.logger.debug('===== Start Delete All Batch Zero =====')
    const affected = await this.productBatchRepository.update(
      { quantity: { EQUAL: 0 }, updatedAt: { GT: Date.now() - 48 * 60 * 60 * 1000 } },
      { deletedAt: Date.now() }
    )
    this.logger.debug(`===== Count Delete: ${affected} =====`)
  }

  async deleteBatchZeroQuantityAll(): Promise<any> {
    this.logger.debug('===== Start Delete All Batch Zero =====')
    const affected = await this.productBatchRepository.update(
      { quantity: { EQUAL: 0 } },
      { deletedAt: Date.now() }
    )
    this.logger.debug(`===== Count Delete: ${affected} =====`)
  }
}
