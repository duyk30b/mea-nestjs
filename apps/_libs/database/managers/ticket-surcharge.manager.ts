import { Injectable } from '@nestjs/common'
import { TicketSurcharge } from '../entities'
import {
  TicketSurchargeInsertType,
  TicketSurchargeRelationType,
  TicketSurchargeSortType,
  TicketSurchargeUpdateType,
} from '../entities/ticket-surcharge.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class TicketSurchargeManager extends _PostgreSqlManager<
  TicketSurcharge,
  TicketSurchargeRelationType,
  TicketSurchargeInsertType,
  TicketSurchargeUpdateType,
  TicketSurchargeSortType
> {
  constructor() {
    super(TicketSurcharge)
  }
}
