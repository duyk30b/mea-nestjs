import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { DeliveryStatus } from '../common/variable'
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

  async calculatorDeliveryStatus(options: {
    manager: EntityManager
    oid: number
    ticketId: number
    ticketProductList?: TicketProduct[]
  }) {
    const { manager, oid, ticketId } = options
    let { ticketProductList } = options
    if (!ticketProductList) {
      ticketProductList = await this.findManyBy(manager, { oid, ticketId })
    }

    let deliveryStatus = DeliveryStatus.Delivered
    if (ticketProductList.every((i) => i.deliveryStatus === DeliveryStatus.NoStock)) {
      deliveryStatus = DeliveryStatus.NoStock
    }
    if (ticketProductList.some((i) => i.deliveryStatus === DeliveryStatus.Pending)) {
      deliveryStatus = DeliveryStatus.Pending
    }

    return { deliveryStatus, ticketProductList }
  }
}
