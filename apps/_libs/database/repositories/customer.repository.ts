import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { Customer } from '../entities'
import {
  CustomerInsertType,
  CustomerRelationType,
  CustomerSortType,
  CustomerUpdateType,
} from '../entities/customer.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class CustomerManager extends _PostgreSqlManager<
  Customer,
  CustomerRelationType,
  CustomerInsertType,
  CustomerUpdateType,
  CustomerSortType
> {
  constructor() {
    super(Customer)
  }
}

@Injectable()
export class CustomerRepository extends _PostgreSqlRepository<
  Customer,
  CustomerRelationType,
  CustomerInsertType,
  CustomerUpdateType,
  CustomerSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>
  ) {
    super(Customer, customerRepository)
  }
}
