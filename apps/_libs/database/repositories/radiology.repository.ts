import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Radiology } from '../entities'
import {
  RadiologyInsertType,
  RadiologyRelationType,
  RadiologySortType,
  RadiologyUpdateType,
} from '../entities/radiology.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class RadiologyRepository extends _PostgreSqlRepository<
  Radiology,
  RadiologyRelationType,
  RadiologyInsertType,
  RadiologyUpdateType,
  RadiologySortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Radiology) private radiologyRepository: Repository<Radiology>
  ) {
    super(Radiology, radiologyRepository)
  }
}
