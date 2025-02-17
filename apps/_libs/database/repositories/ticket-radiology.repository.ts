import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { TicketRadiology } from '../entities'
import {
  TicketRadiologyInsertType,
  TicketRadiologyRelationType,
  TicketRadiologySortType,
  TicketRadiologyUpdateType,
} from '../entities/ticket-radiology.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketRadiologyRepository extends _PostgreSqlRepository<
  TicketRadiology,
  TicketRadiologyRelationType,
  TicketRadiologyInsertType,
  TicketRadiologyUpdateType,
  TicketRadiologySortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketRadiology)
    private ticketRadiologyRepository: Repository<TicketRadiology>
  ) {
    super(TicketRadiology, ticketRadiologyRepository)
  }
}
