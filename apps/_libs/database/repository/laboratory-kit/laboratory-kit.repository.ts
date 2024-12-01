import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { LaboratoryKit } from '../../entities'
import {
  LaboratoryKitInsertType,
  LaboratoryKitRelationType,
  LaboratoryKitSortType,
  LaboratoryKitUpdateType,
} from '../../entities/laboratory-kit.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class LaboratoryKitRepository extends PostgreSqlRepository<
  LaboratoryKit,
  { [P in keyof LaboratoryKitSortType]?: 'ASC' | 'DESC' },
  { [P in keyof LaboratoryKitRelationType]?: boolean },
  LaboratoryKitInsertType,
  LaboratoryKitUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(LaboratoryKit)
    private laboratoryKitRepository: Repository<LaboratoryKit>
  ) {
    super(laboratoryKitRepository)
  }

  F
  async insertOneAndReturnEntity<X extends Partial<LaboratoryKitInsertType>>(
    data: NoExtra<Partial<LaboratoryKitInsertType>, X>
  ): Promise<LaboratoryKit> {
    const raw = await this.insertOneAndReturnRaw(data)
    return LaboratoryKit.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends LaboratoryKitInsertType>(
    data: NoExtra<LaboratoryKitInsertType, X>
  ): Promise<LaboratoryKit> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return LaboratoryKit.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<LaboratoryKitUpdateType>>(
    condition: BaseCondition<LaboratoryKit>,
    data: NoExtra<Partial<LaboratoryKitUpdateType>, X>
  ): Promise<LaboratoryKit[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return LaboratoryKit.fromRaws(raws)
  }
}
