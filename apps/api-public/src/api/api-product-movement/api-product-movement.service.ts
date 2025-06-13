import { Injectable } from '@nestjs/common'
import { uniqueArray } from '../../../../_libs/common/helpers/array.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { MovementType } from '../../../../_libs/database/common/variable'
import {
  Customer,
  Distributor,
  ProductMovement,
  Receipt,
  StockCheck,
  Ticket,
  User,
} from '../../../../_libs/database/entities'
import {
  CustomerRepository,
  DistributorRepository,
  ProductMovementRepository,
  ReceiptRepository,
  StockCheckRepository,
  TicketRepository,
  UserRepository,
} from '../../../../_libs/database/repositories'
import { ProductMovementPaginationQuery } from './request'

@Injectable()
export class ApiProductMovementService {
  constructor(
    private readonly productMovementRepository: ProductMovementRepository,
    private readonly receiptRepository: ReceiptRepository,
    private readonly stockCheckRepository: StockCheckRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly distributorRepository: DistributorRepository,
    private readonly userRepository: UserRepository
  ) { }

  async pagination(oid: number, query: ProductMovementPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query
    const { total, data } = await this.productMovementRepository.pagination({
      relation: { product: relation?.product },
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

    const receiptIds = data
      .filter((i) => i.movementType === MovementType.Receipt)
      .map((i) => i.voucherId)
    const ticketIds = data
      .filter((i) => i.movementType === MovementType.Ticket)
      .map((i) => i.voucherId)
    const stockCheckIds = data
      .filter((i) => i.movementType === MovementType.StockCheck)
      .map((i) => i.voucherId)

    const distributorIds = data
      .filter((i) => i.movementType === MovementType.Receipt)
      .map((i) => i.contactId)
    const customerIds = data
      .filter((i) => i.movementType === MovementType.Ticket)
      .map((i) => i.contactId)
    const userIds = data
      .filter((i) =>
        [MovementType.UserChange, MovementType.StockCheck, MovementType.Excel].includes(
          i.movementType
        ))
      .map((i) => i.contactId)

    const [receiptList, ticketList, stockCheckList, distributorList, customerList, userList] =
      await Promise.all([
        relation?.receipt && receiptIds.length
          ? this.receiptRepository.findMany({ condition: { id: { IN: uniqueArray(receiptIds) } } })
          : <Receipt[]>[],
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

    data.forEach((mov: ProductMovement) => {
      if (mov.movementType === MovementType.Receipt) {
        mov.receipt = receiptList.find((v) => v.id === mov.voucherId)
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

    return {
      data,
      meta: { total, page, limit },
    }
  }
}
