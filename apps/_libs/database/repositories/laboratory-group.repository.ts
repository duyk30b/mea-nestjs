import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { LaboratoryGroup } from '../entities'
import {
  LaboratoryGroupInsertType,
  LaboratoryGroupRelationType,
  LaboratoryGroupSortType,
  LaboratoryGroupUpdateType,
} from '../entities/laboratory-group.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class LaboratoryGroupManager extends _PostgreSqlManager<
  LaboratoryGroup,
  LaboratoryGroupRelationType,
  LaboratoryGroupInsertType,
  LaboratoryGroupUpdateType,
  LaboratoryGroupSortType
> {
  constructor() {
    super(LaboratoryGroup)
  }
}

@Injectable()
export class LaboratoryGroupRepository extends _PostgreSqlRepository<
  LaboratoryGroup,
  LaboratoryGroupRelationType,
  LaboratoryGroupInsertType,
  LaboratoryGroupUpdateType,
  LaboratoryGroupSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(LaboratoryGroup)
    private laboratoryGroupRepository: Repository<LaboratoryGroup>
  ) {
    super(LaboratoryGroup, laboratoryGroupRepository)
  }
}
