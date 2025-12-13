import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { DeliveryStatus, DiscountType } from '../common/variable'
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

  async calculatorDeliveryStatus(options: {
    manager: EntityManager
    oid: number
    ticketId: string
    ticketProductList?: TicketProduct[]
  }) {
    const { manager, oid, ticketId } = options
    let { ticketProductList } = options
    if (!ticketProductList) {
      ticketProductList = await this.findManyBy(manager, { oid, ticketId })
    }

    let deliveryStatus = DeliveryStatus.Delivered
    if (!ticketProductList.length) {
      deliveryStatus = DeliveryStatus.NoStock
    } else if (ticketProductList.every((i) => i.deliveryStatus === DeliveryStatus.NoStock)) {
      deliveryStatus = DeliveryStatus.NoStock
    } else if (ticketProductList.some((i) => i.deliveryStatus === DeliveryStatus.Pending)) {
      deliveryStatus = DeliveryStatus.Pending
    }

    return { deliveryStatus, ticketProductList }
  }
}

export type TicketProductUpdateMoneyType = {
  id: number
  productId: number
  quantity: number
  discountMoney: number
  discountPercent: number
  discountType: DiscountType
  actualPrice: number
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
}
