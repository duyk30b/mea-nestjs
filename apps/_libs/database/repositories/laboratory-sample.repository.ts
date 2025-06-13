import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { LaboratorySample } from '../entities'
import {
  LaboratorySampleInsertType,
  LaboratorySampleRelationType,
  LaboratorySampleSortType,
  LaboratorySampleUpdateType,
} from '../entities/laboratory-sample.entity'
import { _PostgreSqlManager } from '../managers/_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class LaboratorySampleManager extends _PostgreSqlManager<
  LaboratorySample,
  LaboratorySampleRelationType,
  LaboratorySampleInsertType,
  LaboratorySampleUpdateType,
  LaboratorySampleSortType
> {
  constructor() {
    super(LaboratorySample)
  }
}

@Injectable()
export class LaboratorySampleRepository extends _PostgreSqlRepository<
  LaboratorySample,
  LaboratorySampleRelationType,
  LaboratorySampleInsertType,
  LaboratorySampleUpdateType,
  LaboratorySampleSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(LaboratorySample)
    private laboratorySampleRepository: Repository<LaboratorySample>
  ) {
    super(LaboratorySample, laboratorySampleRepository)
  }
}
