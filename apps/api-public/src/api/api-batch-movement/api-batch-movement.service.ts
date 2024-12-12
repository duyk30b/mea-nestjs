import { Injectable } from '@nestjs/common'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { MovementType } from '../../../../_libs/database/common/variable'
import {
  BatchMovement,
  Customer,
  Distributor,
  Receipt,
  Ticket,
  User,
} from '../../../../_libs/database/entities'
import { TicketRepository, UserRepository } from '../../../../_libs/database/repositories'
import { BatchMovementRepository } from '../../../../_libs/database/repositories/bat-movement.repository'
import { CustomerRepository } from '../../../../_libs/database/repositories/customer.repository'
import { DistributorRepository } from '../../../../_libs/database/repositories/distributor.repository'
import { ReceiptRepository } from '../../../../_libs/database/repositories/receipt.repository'
import { BatchMovementGetManyQuery, BatchMovementPaginationQuery } from './request'

@Injectable()
export class ApiBatchMovementService {
  constructor(
    private readonly batchMovementRepository: BatchMovementRepository,
    private readonly receiptRepository: ReceiptRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly distributorRepository: DistributorRepository,
    private readonly userRepository: UserRepository
  ) { }

  async pagination(oid: number, query: BatchMovementPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query
    const { total, data } = await this.batchMovementRepository.pagination({
      relation: {
        product: relation?.product,
        batch: relation?.batch,
      },
      page,
      limit,
      condition: {
        oid,
        productId: filter?.productId,
        batchId: filter?.batchId,
        voucherId: filter?.voucherId,
        contactId: filter?.contactId,
        movementType: filter?.movementType,
      },
      sort,
    })
    const distributorIds = data
      .filter((i) => i.movementType === MovementType.Receipt)
      .map((i) => i.contactId)
    const receiptIds = data
      .filter((i) => i.movementType === MovementType.Receipt)
      .map((i) => i.voucherId)

    const customerIds = data
      .filter((i) => i.movementType === MovementType.Ticket)
      .map((i) => i.contactId)
    const ticketIds = data
      .filter((i) => i.movementType === MovementType.Ticket)
      .map((i) => i.voucherId)

    const userIds = data
      .filter((i) => i.movementType === MovementType.UserChange)
      .map((i) => i.contactId)

    const [distributorList, receiptList, customerList, ticketList, userList] = await Promise.all([
      relation?.distributor && distributorIds.length
        ? this.distributorRepository.findManyBy({ id: { IN: uniqueArray(distributorIds) } })
        : <Distributor[]>[],
      relation?.receipt && receiptIds.length
        ? this.receiptRepository.findMany({ condition: { id: { IN: uniqueArray(receiptIds) } } })
        : <Receipt[]>[],
      relation?.customer && customerIds.length
        ? this.customerRepository.findManyBy({ id: { IN: uniqueArray(customerIds) } })
        : <Customer[]>[],
      relation?.ticket && ticketIds.length
        ? this.ticketRepository.findMany({ condition: { id: { IN: uniqueArray(ticketIds) } } })
        : <Ticket[]>[],
      relation?.user && userIds.length
        ? this.userRepository.findMany({ condition: { id: { IN: uniqueArray(userIds) } } })
        : <User[]>[],
    ])

    data.forEach((mov: BatchMovement) => {
      if (mov.movementType === MovementType.Receipt) {
        mov.distributor = distributorList.find((rc) => rc.id === mov.contactId)
        mov.receipt = receiptList.find((rc) => rc.id === mov.voucherId)
      }
      if (mov.movementType === MovementType.Ticket) {
        mov.ticket = ticketList.find((iv) => iv.id === mov.voucherId)
        mov.customer = customerList.find((rc) => rc.id === mov.contactId)
      }

      if (mov.movementType === MovementType.UserChange) {
        mov.user = userList.find((rc) => rc.id === mov.contactId)
      }
    })

    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: BatchMovementGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query

    const data = await this.batchMovementRepository.findMany({
      relation: {
        product: relation?.product,
        batch: relation?.batch,
      },
      limit,
      condition: {
        oid,
        productId: filter?.productId,
        batchId: filter?.batchId,
        voucherId: filter?.voucherId,
        contactId: filter?.contactId,
        movementType: filter?.movementType,
      },
    })
    return { data }
  }
}
