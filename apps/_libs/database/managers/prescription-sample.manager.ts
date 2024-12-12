import { Injectable } from '@nestjs/common'
import { PrescriptionSample } from '../entities'
import {
  PrescriptionSampleInsertType,
  PrescriptionSampleRelationType,
  PrescriptionSampleSortType,
  PrescriptionSampleUpdateType,
} from '../entities/prescription-sample.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class PrescriptionSampleManager extends _PostgreSqlManager<
  PrescriptionSample,
  PrescriptionSampleRelationType,
  PrescriptionSampleInsertType,
  PrescriptionSampleUpdateType,
  PrescriptionSampleSortType
> {
  constructor() {
    super(PrescriptionSample)
  }
}
