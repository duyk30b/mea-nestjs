import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { CustomerSource } from '../entities'
import {
  CustomerSourceInsertType,
  CustomerSourceRelationType,
  CustomerSourceSortType,
  CustomerSourceUpdateType,
} from '../entities/customer-source.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

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

@Injectable()
export class CustomerSourceRepository extends _PostgreSqlRepository<
  CustomerSource,
  CustomerSourceRelationType,
  CustomerSourceInsertType,
  CustomerSourceUpdateType,
  CustomerSourceSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(CustomerSource) private customerSourceRepository: Repository<CustomerSource>
  ) {
    super(CustomerSource, customerSourceRepository)
  }
}
