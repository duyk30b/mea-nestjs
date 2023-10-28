import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Procedure } from '../../entities'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ProcedureRepository extends PostgreSqlRepository<
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
