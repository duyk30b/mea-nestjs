import { Injectable } from '@nestjs/common'
import { Distributor } from '../entities'
import {
  DistributorInsertType,
  DistributorRelationType,
  DistributorSortType,
  DistributorUpdateType,
} from '../entities/distributor.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class DistributorManager extends _PostgreSqlManager<
  Distributor,
  DistributorRelationType,
  DistributorInsertType,
  DistributorUpdateType,
  DistributorSortType
> {
  constructor() {
    super(Distributor)
  }
}
