import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { TicketAttribute } from '../../entities'
import {
  TicketAttributeInsertType,
  TicketAttributeRelationType,
  TicketAttributeSortType,
  TicketAttributeUpdateType,
} from '../../entities/ticket-attribute.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class TicketAttributeRepository extends PostgreSqlRepository<
  TicketAttribute,
  { [P in keyof TicketAttributeSortType]?: 'ASC' | 'DESC' },
  TicketAttributeRelationType,
  TicketAttributeInsertType,
  TicketAttributeUpdateType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketAttribute)
    private ticketAttributeRepository: Repository<TicketAttribute>
  ) {
    super(ticketAttributeRepository)
  }

  async insertOneFullFieldAndReturnEntity<X extends TicketAttributeInsertType>(
    data: NoExtra<TicketAttributeInsertType, X>
  ): Promise<TicketAttribute> {
    const raw = await this.insertOneAndReturnRaw(data)
    return TicketAttribute.fromRaw(raw)
  }

  async insertManyFullFieldAndReturnEntity<X extends TicketAttributeInsertType>(
    data: NoExtra<TicketAttributeInsertType, X>[]
  ): Promise<TicketAttribute[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return TicketAttribute.fromRaws(raws)
  }

  async insertManyAndReturnEntity<X extends Partial<TicketAttributeInsertType>>(
    data: NoExtra<Partial<TicketAttributeInsertType>, X>[]
  ): Promise<TicketAttribute[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return TicketAttribute.fromRaws(raws)
  }

  async updateAndReturnEntity<X extends Partial<TicketAttributeUpdateType>>(
    condition: BaseCondition<TicketAttribute>,
    data: NoExtra<Partial<TicketAttributeUpdateType>, X>
  ): Promise<TicketAttribute[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return TicketAttribute.fromRaws(raws)
  }
}
