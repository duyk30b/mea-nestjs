import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { CustomerSource } from '../../entities'
import {
  CustomerSourceInsertType,
  CustomerSourceRelationType,
  CustomerSourceSortType,
  CustomerSourceUpdateType,
} from '../../entities/customer-source.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class CustomerSourceRepository extends PostgreSqlRepository<
  CustomerSource,
  { [P in keyof CustomerSourceSortType]?: 'ASC' | 'DESC' },
  { [P in keyof CustomerSourceRelationType]?: boolean },
  CustomerSourceInsertType,
  CustomerSourceUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(CustomerSource) private customerSourceRepository: Repository<CustomerSource>
  ) {
    super(customerSourceRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<CustomerSourceInsertType>>(
    data: NoExtra<Partial<CustomerSourceInsertType>, X>
  ): Promise<CustomerSource> {
    const raw = await this.insertOneAndReturnRaw(data)
    return CustomerSource.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends CustomerSourceInsertType>(
    data: NoExtra<CustomerSourceInsertType, X>
  ): Promise<CustomerSource> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return CustomerSource.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<CustomerSourceUpdateType>>(
    condition: BaseCondition<CustomerSource>,
    data: NoExtra<Partial<CustomerSourceUpdateType>, X>
  ): Promise<CustomerSource[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return CustomerSource.fromRaws(raws)
  }
}
