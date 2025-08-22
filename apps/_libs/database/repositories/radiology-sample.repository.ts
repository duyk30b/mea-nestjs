import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { RadiologySample } from '../entities'
import {
  RadiologySampleInsertType,
  RadiologySampleRelationType,
  RadiologySampleSortType,
  RadiologySampleUpdateType,
} from '../entities/radiology-sample.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class RadiologySampleManager extends _PostgreSqlManager<
  RadiologySample,
  RadiologySampleRelationType,
  RadiologySampleInsertType,
  RadiologySampleUpdateType,
  RadiologySampleSortType
> {
  constructor() {
    super(RadiologySample)
  }
}

@Injectable()
export class RadiologySampleRepository extends _PostgreSqlRepository<
  RadiologySample,
  RadiologySampleRelationType,
  RadiologySampleInsertType,
  RadiologySampleUpdateType,
  RadiologySampleSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(RadiologySample)
    private radiologySampleRepository: Repository<RadiologySample>
  ) {
    super(RadiologySample, radiologySampleRepository)
  }
}
