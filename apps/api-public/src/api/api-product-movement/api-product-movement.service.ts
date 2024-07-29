import { Injectable } from '@nestjs/common'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { VoucherType } from '../../../../_libs/database/common/variable'
import {
  Customer,
  Distributor,
  ProductMovement,
  Receipt,
  Ticket,
} from '../../../../_libs/database/entities'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { DistributorRepository } from '../../../../_libs/database/repository/distributor/distributor.repository'
import { ProductMovementRepository } from '../../../../_libs/database/repository/product-movement/product-movement.repository'
import { ReceiptRepository } from '../../../../_libs/database/repository/receipt/receipt.repository'
import { TicketRepository } from '../../../../_libs/database/repository/ticket/ticket-base/ticket.repository'
import { ProductMovementPaginationQuery } from './request'

@Injectable()
export class ApiProductMovementService {
  constructor(
    private readonly productMovementRepository: ProductMovementRepository,
    private readonly receiptRepository: ReceiptRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly distributorRepository: DistributorRepository
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

    const [distributorList, customerList, receiptList, ticketList] = await Promise.all([
      relation?.distributor && distributorIds.length
        ? this.distributorRepository.findManyBy({ id: { IN: uniqueArray(distributorIds) } })
        : <Distributor[]>[],
      relation?.customer && customerIds.length
        ? this.customerRepository.findManyBy({ id: { IN: uniqueArray(customerIds) } })
        : <Customer[]>[],
      relation?.receipt && receiptIds.length
        ? this.receiptRepository.findMany({ condition: { id: { IN: uniqueArray(receiptIds) } } })
        : <Receipt[]>[],
      relation?.ticket && ticketIds.length
        ? this.ticketRepository.findMany({ condition: { id: { IN: uniqueArray(ticketIds) } } })
        : <Ticket[]>[],
    ])

    data.forEach((mov: ProductMovement) => {
      if (mov.voucherType === VoucherType.Receipt) {
        mov.receipt = receiptList.find((rc) => rc.id === mov.voucherId)
        mov.distributor = distributorList.find((rc) => rc.id === mov.contactId)
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
}
