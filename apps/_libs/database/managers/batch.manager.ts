import { Injectable } from '@nestjs/common'
import { Batch } from '../entities'
import {
  BatchInsertType,
  BatchRelationType,
  BatchSortType,
  BatchUpdateType,
} from '../entities/batch.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class BatchManager extends _PostgreSqlManager<
  Batch,
  BatchRelationType,
  BatchInsertType,
  BatchUpdateType,
  BatchSortType
> {
  constructor() {
    super(Batch)
  }
}
