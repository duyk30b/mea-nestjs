import { Injectable } from '@nestjs/common'
import { TicketProduct } from '../entities'
import {
  TicketProductInsertType,
  TicketProductRelationType,
  TicketProductSortType,
  TicketProductUpdateType,
} from '../entities/ticket-product.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class TicketProductManager extends _PostgreSqlManager<
  TicketProduct,
  TicketProductRelationType,
  TicketProductInsertType,
  TicketProductUpdateType,
  TicketProductSortType
> {
  constructor() {
    super(TicketProduct)
  }
}
