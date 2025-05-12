import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Batch } from '../entities'
import {
  BatchInsertType,
  BatchRelationType,
  BatchSortType,
  BatchUpdateType,
} from '../entities/batch.entity'
import { BatchManager } from '../managers'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class BatchRepository extends _PostgreSqlRepository<
  Batch,
  BatchRelationType,
  BatchInsertType,
  BatchUpdateType,
  BatchSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Batch) private batchRepository: Repository<Batch>,
    private batchManager: BatchManager
  ) {
    super(Batch, batchRepository)
  }

  async mergeBatch(options: {
    oid: number
    productId: number
    batchIdSource: number
    batchIdTarget: number
  }) {
    const { oid, productId, batchIdSource, batchIdTarget } = options

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const batchSourceOrigin = await this.batchManager.deleteOneAndReturnEntity(manager, {
        oid,
        productId,
        id: batchIdSource,
      })

      const batchTargetModified = await this.batchManager.updateOneAndReturnEntity(
        manager,
        { oid, id: batchIdTarget, productId },
        { quantity: () => `quantity + ${batchSourceOrigin.quantity}` }
      )
      return batchTargetModified
    })
  }
}
