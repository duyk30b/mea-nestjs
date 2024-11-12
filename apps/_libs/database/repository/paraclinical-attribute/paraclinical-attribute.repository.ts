import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { ParaclinicalAttribute } from '../../entities'
import {
  ParaclinicalAttributeInsertType,
  ParaclinicalAttributeRelationType,
  ParaclinicalAttributeSortType,
  ParaclinicalAttributeUpdateType,
} from '../../entities/paraclinical-attribute.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ParaclinicalAttributeRepository extends PostgreSqlRepository<
  ParaclinicalAttribute,
  { [P in keyof ParaclinicalAttributeSortType]?: 'ASC' | 'DESC' },
  { [P in keyof ParaclinicalAttributeRelationType]?: boolean },
  ParaclinicalAttributeInsertType,
  ParaclinicalAttributeUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(ParaclinicalAttribute)
    private paraclinicalAttributeRepository: Repository<ParaclinicalAttribute>
  ) {
    super(paraclinicalAttributeRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<ParaclinicalAttributeInsertType>>(
    data: NoExtra<Partial<ParaclinicalAttributeInsertType>, X>
  ): Promise<ParaclinicalAttribute> {
    const raw = await this.insertOneAndReturnRaw(data)
    return ParaclinicalAttribute.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends ParaclinicalAttributeInsertType>(
    data: NoExtra<ParaclinicalAttributeInsertType, X>
  ): Promise<ParaclinicalAttribute> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return ParaclinicalAttribute.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<ParaclinicalAttributeUpdateType>>(
    condition: BaseCondition<ParaclinicalAttribute>,
    data: NoExtra<Partial<ParaclinicalAttributeUpdateType>, X>
  ): Promise<ParaclinicalAttribute[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return ParaclinicalAttribute.fromRaws(raws)
  }

  async insertManyFullFieldAndReturnEntity<X extends ParaclinicalAttributeInsertType>(
    data: NoExtra<ParaclinicalAttributeInsertType, X>[]
  ): Promise<ParaclinicalAttribute[]> {
    const raws = await this.insertManyFullFieldAndReturnRaws(data)
    return ParaclinicalAttribute.fromRaws(raws)
  }
}
