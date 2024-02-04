import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Customer, Invoice } from '../../entities'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class CustomerRepository extends PostgreSqlRepository<
  Customer,
  { [P in 'id' | 'debt' | 'fullName']?: 'ASC' | 'DESC' },
  { [P in keyof Customer]?: never }
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>
  ) {
    super(customerRepository)
  }
}
