import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { DeliveryStatus } from '../common/variable'
import { TicketProduct } from '../entities'
import {
  TicketProductInsertType,
  TicketProductRelationType,
  TicketProductSortType,
  TicketProductUpdateType,
} from '../entities/ticket-product.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

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

@Injectable()
export class TicketProductRepository extends _PostgreSqlRepository<
  TicketProduct,
  TicketProductRelationType,
  TicketProductInsertType,
  TicketProductUpdateType,
  TicketProductSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketProduct) private ticketProductRepository: Repository<TicketProduct>
  ) {
    super(TicketProduct, ticketProductRepository)
  }

  async calculatorDeliveryStatus(options: {
    manager: EntityManager
    oid: number
    ticketId: string
    ticketProductList?: TicketProduct[]
  }) {
    const { manager, oid, ticketId } = options
    let { ticketProductList } = options
    if (!ticketProductList) {
      ticketProductList = await this.managerFindManyBy(manager, { oid, ticketId })
    }

    let deliveryStatus = DeliveryStatus.Delivered
    if (!ticketProductList.length) {
      deliveryStatus = DeliveryStatus.Empty
    } else if (ticketProductList.every((i) => i.quantity === 0)) {
      deliveryStatus = DeliveryStatus.Empty
    } else if (ticketProductList.every((i) => i.quantity === i.quantityCompleted)) {
      deliveryStatus = DeliveryStatus.Delivered
    } else if (ticketProductList.every((i) => i.quantityCompleted === 0)) {
      deliveryStatus = DeliveryStatus.Pending
    } else {
      deliveryStatus = DeliveryStatus.Partial
    }

    return { deliveryStatus, ticketProductList }
  }
}
