import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { TicketDiagnosis } from '../../entities'
import {
  TicketDiagnosisInsertType,
  TicketDiagnosisRelationType,
  TicketDiagnosisSortType,
  TicketDiagnosisUpdateType,
} from '../../entities/ticket-diagnosis.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class TicketDiagnosisRepository extends PostgreSqlRepository<
  TicketDiagnosis,
  { [P in keyof TicketDiagnosisSortType]?: 'ASC' | 'DESC' },
  { [P in keyof TicketDiagnosisRelationType]?: boolean },
  TicketDiagnosisInsertType,
  TicketDiagnosisUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketDiagnosis)
    private ticketDiagnosisRepository: Repository<TicketDiagnosis>
  ) {
    super(ticketDiagnosisRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<TicketDiagnosisInsertType>>(
    data: NoExtra<Partial<TicketDiagnosisInsertType>, X>
  ): Promise<TicketDiagnosis> {
    const raw = await this.insertOneAndReturnRaw(data)
    return TicketDiagnosis.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends TicketDiagnosisInsertType>(
    data: NoExtra<TicketDiagnosisInsertType, X>
  ): Promise<TicketDiagnosis> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return TicketDiagnosis.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<TicketDiagnosisUpdateType>>(
    condition: BaseCondition<TicketDiagnosis>,
    data: NoExtra<Partial<TicketDiagnosisUpdateType>, X>
  ): Promise<TicketDiagnosis[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return TicketDiagnosis.fromRaws(raws)
  }
}
