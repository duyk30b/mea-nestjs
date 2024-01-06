import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Distributor, Receipt } from '../../entities'
import { BaseSqlRepository } from '../base-sql.repository'

@Injectable()
export class DistributorRepository extends BaseSqlRepository<
    Distributor,
    { [P in 'id' | 'debt' | 'fullName']?: 'ASC' | 'DESC' },
    { [P in 'invoice']?: boolean }
> {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(Distributor) private distributorRepository: Repository<Distributor>
    ) {
        super(distributorRepository)
    }
}
