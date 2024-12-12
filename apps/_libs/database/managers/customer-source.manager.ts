import { Injectable } from '@nestjs/common'
import { CustomerSource } from '../entities'
import {
  CustomerSourceInsertType,
  CustomerSourceRelationType,
  CustomerSourceSortType,
  CustomerSourceUpdateType,
} from '../entities/customer-source.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class CustomerSourceManager extends _PostgreSqlManager<
  CustomerSource,
  CustomerSourceRelationType,
  CustomerSourceInsertType,
  CustomerSourceUpdateType,
  CustomerSourceSortType
> {
  constructor() {
    super(CustomerSource)
  }
}
