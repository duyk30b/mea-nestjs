import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Procedure } from '../../entities'
import {
  ProcedureInsertType,
  ProcedureRelationType,
  ProcedureSortType,
  ProcedureUpdateType,
} from '../../entities/procedure.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ProcedureRepository extends PostgreSqlRepository<
  Procedure,
  { [P in keyof ProcedureSortType]?: 'ASC' | 'DESC' },
  { [P in keyof ProcedureRelationType]?: boolean },
  ProcedureInsertType,
  ProcedureUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Procedure) private procedureRepository: Repository<Procedure>
  ) {
    super(procedureRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<ProcedureInsertType>>(
    data: NoExtra<Partial<ProcedureInsertType>, X>
  ): Promise<Procedure> {
    const raw = await this.insertOneAndReturnRaw(data)
    return Procedure.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends ProcedureInsertType>(
    data: NoExtra<ProcedureInsertType, X>
  ): Promise<Procedure> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return Procedure.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<ProcedureUpdateType>>(
    condition: BaseCondition<Procedure>,
    data: NoExtra<Partial<ProcedureUpdateType>, X>
  ): Promise<Procedure[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Procedure.fromRaws(raws)
  }
}
