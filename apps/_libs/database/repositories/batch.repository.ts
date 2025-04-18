import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Batch } from '../entities'
import {
  BatchInsertType,
  BatchRelationType,
  BatchSortType,
  BatchUpdateType,
} from '../entities/batch.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class BatchRepository extends _PostgreSqlRepository<
  Batch,
  BatchRelationType,
  BatchInsertType,
  BatchUpdateType,
  BatchSortType
> {
  constructor(@InjectRepository(Batch) private batchRepository: Repository<Batch>) {
    super(Batch, batchRepository)
  }
}
