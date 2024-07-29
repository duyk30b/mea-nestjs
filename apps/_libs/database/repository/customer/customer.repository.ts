import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Customer } from '../../entities'
import { CustomerInsertType, CustomerRelationType, CustomerSortType, CustomerUpdateType } from '../../entities/customer.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class CustomerRepository extends PostgreSqlRepository<
  Customer,
  { [P in keyof CustomerSortType]?: 'ASC' | 'DESC' },
  { [P in keyof CustomerRelationType]?: never },
  CustomerInsertType,
  CustomerUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>
  ) {
    super(customerRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<CustomerInsertType>>(
    data: NoExtra<Partial<CustomerInsertType>, X>
  ): Promise<Customer> {
    const raw = await this.insertOneAndReturnRaw(data)
    return Customer.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends CustomerInsertType>(
    data: NoExtra<CustomerInsertType, X>
  ): Promise<Customer> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return Customer.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<CustomerUpdateType>>(
    condition: BaseCondition<Customer>,
    data: NoExtra<Partial<CustomerUpdateType>, X>
  ): Promise<Customer[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Customer.fromRaws(raws)
  }
}
