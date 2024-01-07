import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Procedure } from '../../entities'
import { BaseSqlRepository } from '../base-sql.repository'

@Injectable()
export class ProcedureRepository extends BaseSqlRepository<
    Procedure,
    { [P in 'id' | 'name' | 'price']?: 'ASC' | 'DESC' },
    { [P in '']?: boolean }
> {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(Procedure) private procedureRepository: Repository<Procedure>
    ) {
        super(procedureRepository)
    }
}
