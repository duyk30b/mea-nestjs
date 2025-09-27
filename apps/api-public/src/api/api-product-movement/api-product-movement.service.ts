import { Injectable } from '@nestjs/common'
import { ESArray, uniqueArray } from '../../../../_libs/common/helpers/array.helper'
import { MovementType } from '../../../../_libs/database/common/variable'
import {
  Customer,
  Distributor,
  Product,
  ProductMovement,
  PurchaseOrder,
  StockCheck,
  Ticket,
  User,
} from '../../../../_libs/database/entities'
import {
  CustomerRepository,
  DistributorRepository,
  ProductMovementRepository,
  ProductRepository,
  PurchaseOrderRepository,
  StockCheckRepository,
  TicketRepository,
  UserRepository,
} from '../../../../_libs/database/repositories'
import { ProductMovementPaginationQuery } from './request'

@Injectable()
export class ApiProductMovementService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productMovementRepository: ProductMovementRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly stockCheckRepository: StockCheckRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly distributorRepository: DistributorRepository,
    private readonly userRepository: UserRepository
  ) { }

  async pagination(oid: number, query: ProductMovementPaginationQuery) {
    const { page, limit, filter, sort, relation } = query
    const { total, data: productMovementList } = await this.productMovementRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        productId: filter?.productId,
        voucherId: filter?.voucherId,
        contactId: filter?.contactId,
        movementType: filter?.movementType,
      },
      sort,
    })

    const productIdList = ESArray.uniqueArray(productMovementList.map((i) => i.productId))
    const purchaseOrderIds = productMovementList
      .filter((i) => i.movementType === MovementType.PurchaseOrder)
      .map((i) => i.voucherId)
    const ticketIds = productMovementList
      .filter((i) => i.movementType === MovementType.Ticket)
      .map((i) => i.voucherId)
    const stockCheckIds = productMovementList
      .filter((i) => i.movementType === MovementType.StockCheck)
      .map((i) => i.voucherId)

    const distributorIds = productMovementList
      .filter((i) => i.movementType === MovementType.PurchaseOrder)
      .map((i) => i.contactId)
    const customerIds = productMovementList
      .filter((i) => i.movementType === MovementType.Ticket)
      .map((i) => i.contactId)
    const userIds = productMovementList
      .filter((i) =>
        [MovementType.UserChange, MovementType.StockCheck, MovementType.Excel].includes(
          i.movementType
        ))
      .map((i) => i.contactId)

    const [
      productList,
      purchaseOrderList,
      ticketList,
      stockCheckList,
      distributorList,
      customerList,
      userList,
    ] = await Promise.all([
      relation?.product && productIdList.length
        ? this.productRepository.findManyBy({ oid, id: { IN: productIdList } })
        : <Product[]>[],
      relation?.purchaseOrder && purchaseOrderIds.length
        ? this.purchaseOrderRepository.findMany({
          condition: { id: { IN: uniqueArray(purchaseOrderIds) } },
        })
        : <PurchaseOrder[]>[],
      relation?.ticket && ticketIds.length
        ? this.ticketRepository.findMany({ condition: { id: { IN: uniqueArray(ticketIds) } } })
        : <Ticket[]>[],
      relation?.stockCheck && stockCheckIds.length
        ? this.stockCheckRepository.findMany({
          condition: { id: { IN: uniqueArray(stockCheckIds) } },
        })
        : <StockCheck[]>[],
      relation?.distributor && distributorIds.length
        ? this.distributorRepository.findManyBy({ id: { IN: uniqueArray(distributorIds) } })
        : <Distributor[]>[],
      relation?.customer && customerIds.length
        ? this.customerRepository.findManyBy({ id: { IN: uniqueArray(customerIds) } })
        : <Customer[]>[],

      relation?.user && userIds.length
        ? this.userRepository.findMany({ condition: { id: { IN: uniqueArray(userIds) } } })
        : <User[]>[],
    ])

    const productMap = ESArray.arrayToKeyValue(productList, 'id')

    productMovementList.forEach((mov: ProductMovement) => {
      if (relation?.product) {
        mov.product = productMap[mov.productId]
      }
      if (mov.movementType === MovementType.PurchaseOrder) {
        mov.purchaseOrder = purchaseOrderList.find((v) => v.id === mov.voucherId)
        mov.distributor = distributorList.find((c) => c.id === mov.contactId)
      }
      if (mov.movementType === MovementType.Ticket) {
        mov.ticket = ticketList.find((v) => v.id === mov.voucherId)
        mov.customer = customerList.find((c) => c.id === mov.contactId)
      }
      if (mov.movementType === MovementType.UserChange) {
        mov.user = userList.find((c) => c.id === mov.contactId)
      }
      if (mov.movementType === MovementType.StockCheck) {
        mov.stockCheck = stockCheckList.find((v) => v.id === mov.voucherId)
        mov.user = userList.find((c) => c.id === mov.contactId)
      }
      if (mov.movementType === MovementType.Excel) {
        mov.user = userList.find((c) => c.id === mov.contactId)
      }
    })

    return { productMovementList, total, page, limit }
  }
}
