import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, InsertResult, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { VisitDiagnosis } from '../../entities'
import {
  VisitDiagnosisInsertType,
  VisitDiagnosisUpdateType,
} from '../../entities/visit-diagnosis.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class VisitDiagnosisRepository extends PostgreSqlRepository<
  VisitDiagnosis,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in 'customer']?: boolean },
  VisitDiagnosisInsertType,
  VisitDiagnosisUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(VisitDiagnosis) private visitDiagnosisRepository: Repository<VisitDiagnosis>
  ) {
    super(visitDiagnosisRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<VisitDiagnosisInsertType>>(
    data: NoExtra<Partial<VisitDiagnosisInsertType>, X>
  ): Promise<VisitDiagnosis> {
    const raw = await this.insertOneAndReturnRaw(data)
    return VisitDiagnosis.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends VisitDiagnosisInsertType>(
    data: NoExtra<VisitDiagnosisInsertType, X>
  ): Promise<VisitDiagnosis> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return VisitDiagnosis.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<VisitDiagnosisUpdateType>>(
    condition: BaseCondition<VisitDiagnosis>,
    data: NoExtra<Partial<VisitDiagnosisUpdateType>, X>
  ): Promise<VisitDiagnosis[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return VisitDiagnosis.fromRaws(raws)
  }
}
