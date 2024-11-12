import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { ParaclinicalGroup } from '../../entities'
import {
  ParaclinicalGroupInsertType,
  ParaclinicalGroupRelationType,
  ParaclinicalGroupSortType,
  ParaclinicalGroupUpdateType,
} from '../../entities/paraclinical-group.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ParaclinicalGroupRepository extends PostgreSqlRepository<
  ParaclinicalGroup,
  { [P in keyof ParaclinicalGroupSortType]?: 'ASC' | 'DESC' },
  { [P in keyof ParaclinicalGroupRelationType]?: boolean },
  ParaclinicalGroupInsertType,
  ParaclinicalGroupUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(ParaclinicalGroup)
    private paraclinicalGroupRepository: Repository<ParaclinicalGroup>
  ) {
    super(paraclinicalGroupRepository)
  }

  F
  async insertOneAndReturnEntity<X extends Partial<ParaclinicalGroupInsertType>>(
    data: NoExtra<Partial<ParaclinicalGroupInsertType>, X>
  ): Promise<ParaclinicalGroup> {
    const raw = await this.insertOneAndReturnRaw(data)
    return ParaclinicalGroup.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends ParaclinicalGroupInsertType>(
    data: NoExtra<ParaclinicalGroupInsertType, X>
  ): Promise<ParaclinicalGroup> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return ParaclinicalGroup.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<ParaclinicalGroupUpdateType>>(
    condition: BaseCondition<ParaclinicalGroup>,
    data: NoExtra<Partial<ParaclinicalGroupUpdateType>, X>
  ): Promise<ParaclinicalGroup[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return ParaclinicalGroup.fromRaws(raws)
  }
}
