import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { ICD } from '../entities'
import {
  ICDInsertType,
  ICDRelationType,
  ICDSortType,
  ICDUpdateType,
} from '../entities/icd.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class ICDManager extends _PostgreSqlManager<
  ICD,
  ICDRelationType,
  ICDInsertType,
  ICDUpdateType,
  ICDSortType
> {
  constructor() {
    super(ICD)
  }
}

@Injectable()
export class ICDRepository extends _PostgreSqlRepository<
  ICD,
  ICDRelationType,
  ICDInsertType,
  ICDUpdateType,
  ICDSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(ICD)
    private icdRepository: Repository<ICD>
  ) {
    super(ICD, icdRepository)
  }
}
