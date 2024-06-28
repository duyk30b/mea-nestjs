import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { VisitRadiology } from '../../entities'
import {
  VisitRadiologyInsertType,
  VisitRadiologyRelationType,
  VisitRadiologySortType,
  VisitRadiologyUpdateType,
} from '../../entities/visit-radiology.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class VisitRadiologyRepository extends PostgreSqlRepository<
  VisitRadiology,
  { [P in keyof VisitRadiologySortType]?: 'ASC' | 'DESC' },
  { [P in keyof VisitRadiologyRelationType]?: boolean },
  VisitRadiologyInsertType,
  VisitRadiologyUpdateType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(VisitRadiology) private visitRadiologyRepository: Repository<VisitRadiology>
  ) {
    super(visitRadiologyRepository)
  }

  async insertOneFullFieldAndReturnEntity<X extends VisitRadiologyInsertType>(
    data: NoExtra<VisitRadiologyInsertType, X>
  ): Promise<VisitRadiology> {
    const raw = await this.insertOneAndReturnRaw(data)
    return VisitRadiology.fromRaw(raw)
  }

  async insertManyAndReturnEntity<X extends Partial<VisitRadiologyInsertType>>(
    data: NoExtra<Partial<VisitRadiologyInsertType>, X>[]
  ): Promise<VisitRadiology[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return VisitRadiology.fromRaws(raws)
  }

  async updateAndReturnEntity<X extends Partial<VisitRadiologyUpdateType>>(
    condition: BaseCondition<VisitRadiology>,
    data: NoExtra<Partial<VisitRadiologyUpdateType>, X>
  ): Promise<VisitRadiology[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return VisitRadiology.fromRaws(raws)
  }
}
