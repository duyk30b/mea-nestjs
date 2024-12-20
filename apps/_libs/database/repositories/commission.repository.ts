import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Commission } from '../entities'
import {
  CommissionInsertType,
  CommissionRelationType,
  CommissionSortType,
  CommissionUpdateType,
} from '../entities/commission.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class CommissionRepository extends _PostgreSqlRepository<
  Commission,
  CommissionRelationType,
  CommissionInsertType,
  CommissionUpdateType,
  CommissionSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Commission) private commissionRepository: Repository<Commission>
  ) {
    super(Commission, commissionRepository)
  }
}
