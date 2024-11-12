import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Paraclinical } from '../../entities'
import {
  ParaclinicalInsertType,
  ParaclinicalRelationType,
  ParaclinicalSortType,
  ParaclinicalUpdateType,
} from '../../entities/paraclinical.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ParaclinicalRepository extends PostgreSqlRepository<
  Paraclinical,
  { [P in keyof ParaclinicalSortType]?: 'ASC' | 'DESC' },
  { [P in keyof ParaclinicalRelationType]?: boolean },
  ParaclinicalInsertType,
  ParaclinicalUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Paraclinical) private paraclinicalRepository: Repository<Paraclinical>
  ) {
    super(paraclinicalRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<ParaclinicalInsertType>>(
    data: NoExtra<Partial<ParaclinicalInsertType>, X>
  ): Promise<Paraclinical> {
    const raw = await this.insertOneAndReturnRaw(data)
    return Paraclinical.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends ParaclinicalInsertType>(
    data: NoExtra<ParaclinicalInsertType, X>
  ): Promise<Paraclinical> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return Paraclinical.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<ParaclinicalUpdateType>>(
    condition: BaseCondition<Paraclinical>,
    data: NoExtra<Partial<ParaclinicalUpdateType>, X>
  ): Promise<Paraclinical[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Paraclinical.fromRaws(raws)
  }
}
