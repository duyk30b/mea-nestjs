import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { Procedure } from '../entities'
import {
  ProcedureInsertType,
  ProcedureRelationType,
  ProcedureSortType,
  ProcedureUpdateType,
} from '../entities/procedure.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class ProcedureManager extends _PostgreSqlManager<
  Procedure,
  ProcedureRelationType,
  ProcedureInsertType,
  ProcedureUpdateType,
  ProcedureSortType
> {
  constructor() {
    super(Procedure)
  }
}

@Injectable()
export class ProcedureRepository extends _PostgreSqlRepository<
  Procedure,
  ProcedureRelationType,
  ProcedureInsertType,
  ProcedureUpdateType,
  ProcedureSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Procedure) private procedureRepository: Repository<Procedure>
  ) {
    super(Procedure, procedureRepository)
  }
}
