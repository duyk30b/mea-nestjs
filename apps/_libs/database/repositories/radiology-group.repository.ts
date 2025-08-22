import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { RadiologyGroup } from '../entities'
import {
  RadiologyGroupInsertType,
  RadiologyGroupRelationType,
  RadiologyGroupSortType,
  RadiologyGroupUpdateType,
} from '../entities/radiology-group.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class RadiologyGroupManager extends _PostgreSqlManager<
  RadiologyGroup,
  RadiologyGroupRelationType,
  RadiologyGroupInsertType,
  RadiologyGroupUpdateType,
  RadiologyGroupSortType
> {
  constructor() {
    super(RadiologyGroup)
  }
}

@Injectable()
export class RadiologyGroupRepository extends _PostgreSqlRepository<
  RadiologyGroup,
  RadiologyGroupRelationType,
  RadiologyGroupInsertType,
  RadiologyGroupUpdateType,
  RadiologyGroupSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(RadiologyGroup)
    private radiologyGroupRepository: Repository<RadiologyGroup>
  ) {
    super(RadiologyGroup, radiologyGroupRepository)
  }
}
