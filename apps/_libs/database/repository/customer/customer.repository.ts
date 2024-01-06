import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Customer, Invoice } from '../../entities'
import { BaseSqlRepository } from '../base-sql.repository'

@Injectable()
export class CustomerRepository extends BaseSqlRepository<
    Customer,
    { [P in 'id' | 'debt' | 'fullName']?: 'ASC' | 'DESC' },
    { [P in 'invoice']?: boolean }
> {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(Customer) private customerRepository: Repository<Customer>
    ) {
        super(customerRepository)
    }
}
