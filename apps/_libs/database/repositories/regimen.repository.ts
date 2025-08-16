import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { Regimen } from '../entities'
import {
  RegimenInsertType,
  RegimenRelationType,
  RegimenSortType,
  RegimenUpdateType,
} from '../entities/regimen.entity'
import { _PostgreSqlManager } from '../managers/_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class RegimenManager extends _PostgreSqlManager<
  Regimen,
  RegimenRelationType,
  RegimenInsertType,
  RegimenUpdateType,
  RegimenSortType
> {
  constructor() {
    super(Regimen)
  }
}

@Injectable()
export class RegimenRepository extends _PostgreSqlRepository<
  Regimen,
  RegimenRelationType,
  RegimenInsertType,
  RegimenUpdateType,
  RegimenSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Regimen) private regimenRepository: Repository<Regimen>
  ) {
    super(Regimen, regimenRepository)
  }
}
