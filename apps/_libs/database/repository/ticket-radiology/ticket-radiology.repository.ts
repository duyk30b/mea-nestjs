import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { TicketRadiology } from '../../entities'
import {
  TicketRadiologyInsertType,
  TicketRadiologyRelationType,
  TicketRadiologySortType,
  TicketRadiologyUpdateType,
} from '../../entities/ticket-radiology.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class TicketRadiologyRepository extends PostgreSqlRepository<
  TicketRadiology,
  { [P in keyof TicketRadiologySortType]?: 'ASC' | 'DESC' },
  TicketRadiologyRelationType,
  TicketRadiologyInsertType,
  TicketRadiologyUpdateType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketRadiology)
    private ticketRadiologyRepository: Repository<TicketRadiology>
  ) {
    super(ticketRadiologyRepository)
  }

  async insertOneFullFieldAndReturnEntity<X extends TicketRadiologyInsertType>(
    data: NoExtra<TicketRadiologyInsertType, X>
  ): Promise<TicketRadiology> {
    const raw = await this.insertOneAndReturnRaw(data)
    return TicketRadiology.fromRaw(raw)
  }

  async insertManyAndReturnEntity<X extends Partial<TicketRadiologyInsertType>>(
    data: NoExtra<Partial<TicketRadiologyInsertType>, X>[]
  ): Promise<TicketRadiology[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return TicketRadiology.fromRaws(raws)
  }

  async updateAndReturnEntity<X extends Partial<TicketRadiologyUpdateType>>(
    condition: BaseCondition<TicketRadiology>,
    data: NoExtra<Partial<TicketRadiologyUpdateType>, X>
  ): Promise<TicketRadiology[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return TicketRadiology.fromRaws(raws)
  }
}
