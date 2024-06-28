import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Radiology } from '../../entities'
import {
  RadiologyInsertType,
  RadiologyRelationType,
  RadiologySortType,
  RadiologyUpdateType,
} from '../../entities/radiology.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class RadiologyRepository extends PostgreSqlRepository<
  Radiology,
  { [P in keyof RadiologySortType]?: 'ASC' | 'DESC' },
  { [P in keyof RadiologyRelationType]?: boolean },
  RadiologyInsertType,
  RadiologyUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Radiology) private radiologyRepository: Repository<Radiology>
  ) {
    super(radiologyRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<RadiologyInsertType>>(
    data: NoExtra<Partial<RadiologyInsertType>, X>
  ): Promise<Radiology> {
    const raw = await this.insertOneAndReturnRaw(data)
    return Radiology.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends RadiologyInsertType>(
    data: NoExtra<RadiologyInsertType, X>
  ): Promise<Radiology> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return Radiology.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<RadiologyUpdateType>>(
    condition: BaseCondition<Radiology>,
    data: NoExtra<Partial<RadiologyUpdateType>, X>
  ): Promise<Radiology[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Radiology.fromRaws(raws)
  }
}
