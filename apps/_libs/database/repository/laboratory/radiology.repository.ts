import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Laboratory } from '../../entities'
import {
  LaboratoryInsertType,
  LaboratoryRelationType,
  LaboratorySortType,
  LaboratoryUpdateType,
} from '../../entities/laboratory.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class LaboratoryRepository extends PostgreSqlRepository<
  Laboratory,
  { [P in keyof LaboratorySortType]?: 'ASC' | 'DESC' },
  { [P in keyof LaboratoryRelationType]?: boolean },
  LaboratoryInsertType,
  LaboratoryUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Laboratory) private laboratoryRepository: Repository<Laboratory>
  ) {
    super(laboratoryRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<LaboratoryInsertType>>(
    data: NoExtra<Partial<LaboratoryInsertType>, X>
  ): Promise<Laboratory> {
    const raw = await this.insertOneAndReturnRaw(data)
    return Laboratory.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends LaboratoryInsertType>(
    data: NoExtra<LaboratoryInsertType, X>
  ): Promise<Laboratory> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return Laboratory.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<LaboratoryUpdateType>>(
    condition: BaseCondition<Laboratory>,
    data: NoExtra<Partial<LaboratoryUpdateType>, X>
  ): Promise<Laboratory[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Laboratory.fromRaws(raws)
  }
}
