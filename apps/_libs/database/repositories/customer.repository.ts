import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { Customer } from '../entities'
import { CustomerInsertType, CustomerRelationType, CustomerSortType, CustomerUpdateType } from '../entities/customer.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

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

  async sumDebt(oid: number): Promise<number> {
    const { sum } = await this.manager
      .createQueryBuilder(Customer, 'customer')
      .select('SUM(debt)', 'sum')
      .where({ oid })
      .getRawOne()
    return Number(sum)
  }
}
