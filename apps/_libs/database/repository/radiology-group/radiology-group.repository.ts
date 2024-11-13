import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { RadiologyGroup } from '../../entities'
import {
  RadiologyGroupInsertType,
  RadiologyGroupRelationType,
  RadiologyGroupSortType,
  RadiologyGroupUpdateType,
} from '../../entities/radiology-group.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class RadiologyGroupRepository extends PostgreSqlRepository<
  RadiologyGroup,
  { [P in keyof RadiologyGroupSortType]?: 'ASC' | 'DESC' },
  { [P in keyof RadiologyGroupRelationType]?: boolean },
  RadiologyGroupInsertType,
  RadiologyGroupUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(RadiologyGroup)
    private radiologyGroupRepository: Repository<RadiologyGroup>
  ) {
    super(radiologyGroupRepository)
  }

  F
  async insertOneAndReturnEntity<X extends Partial<RadiologyGroupInsertType>>(
    data: NoExtra<Partial<RadiologyGroupInsertType>, X>
  ): Promise<RadiologyGroup> {
    const raw = await this.insertOneAndReturnRaw(data)
    return RadiologyGroup.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends RadiologyGroupInsertType>(
    data: NoExtra<RadiologyGroupInsertType, X>
  ): Promise<RadiologyGroup> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return RadiologyGroup.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<RadiologyGroupUpdateType>>(
    condition: BaseCondition<RadiologyGroup>,
    data: NoExtra<Partial<RadiologyGroupUpdateType>, X>
  ): Promise<RadiologyGroup[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return RadiologyGroup.fromRaws(raws)
  }
}
