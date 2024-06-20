import { Injectable } from '@nestjs/common'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { VoucherType } from '../../../../_libs/database/common/variable'
import {
  BatchMovement,
  Customer,
  Distributor,
  Invoice,
  Receipt,
  Visit,
} from '../../../../_libs/database/entities'
import { BatchMovementRepository } from '../../../../_libs/database/repository/batch-movement/bat-movement.repository'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { DistributorRepository } from '../../../../_libs/database/repository/distributor/distributor.repository'
import { InvoiceRepository } from '../../../../_libs/database/repository/invoice/invoice.repository'
import { ReceiptRepository } from '../../../../_libs/database/repository/receipt/receipt.repository'
import { VisitRepository } from '../../../../_libs/database/repository/visit/visit.repository'
import { BatchMovementGetManyQuery, BatchMovementPaginationQuery } from './request'

@Injectable()
export class ApiBatchMovementService {
  constructor(
    private readonly batchMovementRepository: BatchMovementRepository,
    private readonly receiptRepository: ReceiptRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly visitRepository: VisitRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly distributorRepository: DistributorRepository
  ) {}

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

    const receiptIds = data
      .filter((i) => i.voucherType === VoucherType.Receipt)
      .map((i) => i.voucherId)
    const invoiceIds = data
      .filter((i) => i.voucherType === VoucherType.Invoice)
      .map((i) => i.voucherId)
    const visitIds = data.filter((i) => i.voucherType === VoucherType.Visit).map((i) => i.voucherId)
    const distributorIds = data
      .filter((i) => i.voucherType === VoucherType.Receipt)
      .map((i) => i.contactId)
    const customerIds = data
      .filter((i) => i.voucherType === VoucherType.Invoice || i.voucherType === VoucherType.Visit)
      .map((i) => i.contactId)

    const [receiptList, invoiceList, visitList, distributorList, customerList] = await Promise.all([
      relation?.receipt && receiptIds.length
        ? this.receiptRepository.findMany({ condition: { id: { IN: uniqueArray(receiptIds) } } })
        : <Receipt[]>[],
      relation?.invoice && invoiceIds.length
        ? this.invoiceRepository.findMany({ condition: { id: { IN: uniqueArray(invoiceIds) } } })
        : <Invoice[]>[],
      relation?.visit && visitIds.length
        ? this.visitRepository.findMany({ condition: { id: { IN: uniqueArray(visitIds) } } })
        : <Visit[]>[],
      relation?.distributor && distributorIds.length
        ? this.distributorRepository.findManyBy({ id: { IN: uniqueArray(distributorIds) } })
        : <Distributor[]>[],
      relation?.customer && customerIds.length
        ? this.customerRepository.findManyBy({ id: { IN: uniqueArray(customerIds) } })
        : <Customer[]>[],
    ])

    data.forEach((mov: BatchMovement) => {
      if (mov.voucherType === VoucherType.Receipt) {
        mov.receipt = receiptList.find((rc) => rc.id === mov.voucherId)
        mov.distributor = distributorList.find((rc) => rc.id === mov.contactId)
      }
      if (mov.voucherType === VoucherType.Invoice) {
        mov.invoice = invoiceList.find((iv) => iv.id === mov.voucherId)
        mov.customer = customerList.find((rc) => rc.id === mov.contactId)
      }
      if (mov.voucherType === VoucherType.Visit) {
        mov.visit = visitList.find((iv) => iv.id === mov.voucherId)
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
