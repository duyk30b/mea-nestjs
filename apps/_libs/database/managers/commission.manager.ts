import { Injectable } from '@nestjs/common'
import { Commission } from '../entities'
import {
  CommissionInsertType,
  CommissionRelationType,
  CommissionSortType,
  CommissionUpdateType,
} from '../entities/commission.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class CommissionManager extends _PostgreSqlManager<
  Commission,
  CommissionRelationType,
  CommissionInsertType,
  CommissionUpdateType,
  CommissionSortType
> {
  constructor() {
    super(Commission)
  }
}
