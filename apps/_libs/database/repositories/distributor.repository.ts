import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Distributor } from '../entities'
import {
  DistributorInsertType,
  DistributorRelationType,
  DistributorSortType,
  DistributorUpdateType,
} from '../entities/distributor.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class DistributorRepository extends _PostgreSqlRepository<
  Distributor,
  DistributorRelationType,
  DistributorInsertType,
  DistributorUpdateType,
  DistributorSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Distributor) private distributorRepository: Repository<Distributor>
  ) {
    super(Distributor, distributorRepository)
  }
}
