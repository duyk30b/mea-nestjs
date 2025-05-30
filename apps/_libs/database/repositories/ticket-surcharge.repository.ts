import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { TicketSurcharge } from '../entities'
import {
  TicketSurchargeInsertType,
  TicketSurchargeRelationType,
  TicketSurchargeSortType,
  TicketSurchargeUpdateType,
} from '../entities/ticket-surcharge.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketSurchargeRepository extends _PostgreSqlRepository<
  TicketSurcharge,
  TicketSurchargeRelationType,
  TicketSurchargeInsertType,
  TicketSurchargeUpdateType,
  TicketSurchargeSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketSurcharge)
    private ticketSurchargeRepository: Repository<TicketSurcharge>
  ) {
    super(TicketSurcharge, ticketSurchargeRepository)
  }
}
