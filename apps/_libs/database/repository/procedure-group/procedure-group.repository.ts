import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { ProcedureGroup } from '../../entities'
import {
  ProcedureGroupInsertType,
  ProcedureGroupRelationType,
  ProcedureGroupSortType,
  ProcedureGroupUpdateType,
} from '../../entities/procedure-group.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ProcedureGroupRepository extends PostgreSqlRepository<
  ProcedureGroup,
  { [P in keyof ProcedureGroupSortType]?: 'ASC' | 'DESC' },
  { [P in keyof ProcedureGroupRelationType]?: boolean },
  ProcedureGroupInsertType,
  ProcedureGroupUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(ProcedureGroup) private procedureGroupRepository: Repository<ProcedureGroup>
  ) {
    super(procedureGroupRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<ProcedureGroupInsertType>>(
    data: NoExtra<Partial<ProcedureGroupInsertType>, X>
  ): Promise<ProcedureGroup> {
    const raw = await this.insertOneAndReturnRaw(data)
    return ProcedureGroup.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends ProcedureGroupInsertType>(
    data: NoExtra<ProcedureGroupInsertType, X>
  ): Promise<ProcedureGroup> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return ProcedureGroup.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<ProcedureGroupUpdateType>>(
    condition: BaseCondition<ProcedureGroup>,
    data: NoExtra<Partial<ProcedureGroupUpdateType>, X>
  ): Promise<ProcedureGroup[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return ProcedureGroup.fromRaws(raws)
  }
}
