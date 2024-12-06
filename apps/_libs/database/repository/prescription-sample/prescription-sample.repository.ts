import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { PrescriptionSample } from '../../entities'
import {
  PrescriptionSampleInsertType,
  PrescriptionSampleRelationType,
  PrescriptionSampleSortType,
  PrescriptionSampleUpdateType,
} from '../../entities/prescription-sample.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class PrescriptionSampleRepository extends PostgreSqlRepository<
  PrescriptionSample,
  PrescriptionSampleSortType,
  PrescriptionSampleRelationType,
  PrescriptionSampleInsertType,
  PrescriptionSampleUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(PrescriptionSample)
    private prescriptionSampleRepository: Repository<PrescriptionSample>
  ) {
    super(prescriptionSampleRepository)
  }

  F
  async insertOneAndReturnEntity<X extends Partial<PrescriptionSampleInsertType>>(
    data: NoExtra<Partial<PrescriptionSampleInsertType>, X>
  ): Promise<PrescriptionSample> {
    const raw = await this.insertOneAndReturnRaw(data)
    return PrescriptionSample.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends PrescriptionSampleInsertType>(
    data: NoExtra<PrescriptionSampleInsertType, X>
  ): Promise<PrescriptionSample> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return PrescriptionSample.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<PrescriptionSampleUpdateType>>(
    condition: BaseCondition<PrescriptionSample>,
    data: NoExtra<Partial<PrescriptionSampleUpdateType>, X>
  ): Promise<PrescriptionSample[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return PrescriptionSample.fromRaws(raws)
  }
}
