import { Injectable } from '@nestjs/common'
import { Customer } from '../entities'
import {
  CustomerInsertType,
  CustomerRelationType,
  CustomerSortType,
  CustomerUpdateType,
} from '../entities/customer.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

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
