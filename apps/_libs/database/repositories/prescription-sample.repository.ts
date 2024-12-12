import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { PrescriptionSample } from '../entities'
import {
  PrescriptionSampleInsertType,
  PrescriptionSampleRelationType,
  PrescriptionSampleSortType,
  PrescriptionSampleUpdateType,
} from '../entities/prescription-sample.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PrescriptionSampleRepository extends _PostgreSqlRepository<
  PrescriptionSample,
  PrescriptionSampleRelationType,
  PrescriptionSampleInsertType,
  PrescriptionSampleUpdateType,
  PrescriptionSampleSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(PrescriptionSample)
    private prescriptionSampleRepository: Repository<PrescriptionSample>
  ) {
    super(PrescriptionSample, prescriptionSampleRepository)
  }
}
