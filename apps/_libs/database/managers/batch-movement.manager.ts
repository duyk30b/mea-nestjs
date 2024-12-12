import { Injectable } from '@nestjs/common'
import { BatchMovement } from '../entities'
import {
  BatchMovementInsertType,
  BatchMovementRelationType,
  BatchMovementSortType,
  BatchMovementUpdateType,
} from '../entities/batch-movement.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class BatchMovementManager extends _PostgreSqlManager<
  BatchMovement,
  BatchMovementRelationType,
  BatchMovementInsertType,
  BatchMovementUpdateType,
  BatchMovementSortType
> {
  constructor() {
    super(BatchMovement)
  }
}
