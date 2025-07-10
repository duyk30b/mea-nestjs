import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Discount } from '../entities'
import {
  DiscountInsertType,
  DiscountRelationType,
  DiscountSortType,
  DiscountUpdateType,
} from '../entities/discount.entity'
import { _PostgreSqlManager } from '../managers/_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class DiscountManager extends _PostgreSqlManager<
  Discount,
  DiscountRelationType,
  DiscountInsertType,
  DiscountUpdateType,
  DiscountSortType
> {
  constructor() {
    super(Discount)
  }
}

@Injectable()
export class DiscountRepository extends _PostgreSqlRepository<
  Discount,
  DiscountRelationType,
  DiscountInsertType,
  DiscountUpdateType,
  DiscountSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Discount) private discountRepository: Repository<Discount>
  ) {
    super(Discount, discountRepository)
  }
}
