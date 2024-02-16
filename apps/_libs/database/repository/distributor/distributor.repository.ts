import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Distributor, Receipt } from '../../entities'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class DistributorRepository extends PostgreSqlRepository<
  Distributor,
  { [P in 'id' | 'debt' | 'fullName']?: 'ASC' | 'DESC' },
  { [P in keyof Distributor]?: never }
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Distributor) private distributorRepository: Repository<Distributor>
  ) {
    super(distributorRepository)
  }
}
