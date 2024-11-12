import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { TicketParaclinical } from '../../entities'
import {
  TicketParaclinicalInsertType,
  TicketParaclinicalRelationType,
  TicketParaclinicalSortType,
  TicketParaclinicalUpdateType,
} from '../../entities/ticket-paraclinical.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class TicketParaclinicalRepository extends PostgreSqlRepository<
  TicketParaclinical,
  { [P in keyof TicketParaclinicalSortType]?: 'ASC' | 'DESC' },
  TicketParaclinicalRelationType,
  TicketParaclinicalInsertType,
  TicketParaclinicalUpdateType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketParaclinical)
    private ticketParaclinicalRepository: Repository<TicketParaclinical>
  ) {
    super(ticketParaclinicalRepository)
  }

  async insertOneFullFieldAndReturnEntity<X extends TicketParaclinicalInsertType>(
    data: NoExtra<TicketParaclinicalInsertType, X>
  ): Promise<TicketParaclinical> {
    const raw = await this.insertOneAndReturnRaw(data)
    return TicketParaclinical.fromRaw(raw)
  }

  async insertManyAndReturnEntity<X extends Partial<TicketParaclinicalInsertType>>(
    data: NoExtra<Partial<TicketParaclinicalInsertType>, X>[]
  ): Promise<TicketParaclinical[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return TicketParaclinical.fromRaws(raws)
  }

  async updateAndReturnEntity<X extends Partial<TicketParaclinicalUpdateType>>(
    condition: BaseCondition<TicketParaclinical>,
    data: NoExtra<Partial<TicketParaclinicalUpdateType>, X>
  ): Promise<TicketParaclinical[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return TicketParaclinical.fromRaws(raws)
  }
}
