import { Injectable } from '@nestjs/common'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { VoucherType } from '../../../../_libs/database/common/variable'
import {
  BatchMovement,
  Customer,
  Distributor,
  Receipt,
  Ticket,
} from '../../../../_libs/database/entities'
import { BatchMovementRepository } from '../../../../_libs/database/repository/batch-movement/bat-movement.repository'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { DistributorRepository } from '../../../../_libs/database/repository/distributor/distributor.repository'
import { ReceiptRepository } from '../../../../_libs/database/repository/receipt/receipt.repository'
import { TicketRepository } from '../../../../_libs/database/repository/ticket/ticket-base/ticket.repository'
import { BatchMovementGetManyQuery, BatchMovementPaginationQuery } from './request'

@Injectable()
export class ApiBatchMovementService {
  constructor(
    private readonly batchMovementRepository: BatchMovementRepository,
    private readonly receiptRepository: ReceiptRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly distributorRepository: DistributorRepository
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
        voucherType: filter?.voucherType,
      },
      sort,
    })
    const distributorIds = data
      .filter((i) => i.voucherType === VoucherType.Receipt)
      .map((i) => i.contactId)
    const receiptIds = data
      .filter((i) => i.voucherType === VoucherType.Receipt)
      .map((i) => i.voucherId)
    const customerIds = data
      .filter((i) => i.voucherType === VoucherType.Ticket)
      .map((i) => i.contactId)
    const ticketIds = data
      .filter((i) => i.voucherType === VoucherType.Ticket)
      .map((i) => i.voucherId)

    const [distributorList, receiptList, customerList, ticketList] = await Promise.all([
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
    ])

    data.forEach((mov: BatchMovement) => {
      if (mov.voucherType === VoucherType.Receipt) {
        mov.distributor = distributorList.find((rc) => rc.id === mov.contactId)
        mov.receipt = receiptList.find((rc) => rc.id === mov.voucherId)
      }
      if (mov.voucherType === VoucherType.Ticket) {
        mov.ticket = ticketList.find((iv) => iv.id === mov.voucherId)
        mov.customer = customerList.find((rc) => rc.id === mov.contactId)
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
        voucherType: filter?.voucherType,
      },
    })
    return { data }
  }
}
