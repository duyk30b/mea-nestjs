import { Injectable } from '@nestjs/common'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import {
  Batch,
  Invoice,
  InvoiceItem,
  Procedure,
  Product,
} from '../../../../_libs/database/entities'
import { BatchRepository } from '../../../../_libs/database/repository/batch/batch.repository'
import { InvoiceItemRepository } from '../../../../_libs/database/repository/invoice-item/invoice-item.repository'
import { InvoiceRepository } from '../../../../_libs/database/repository/invoice/invoice.repository'
import { ProcedureRepository } from '../../../../_libs/database/repository/procedure/procedure.repository'
import { ProductRepository } from '../../../../_libs/database/repository/product/product.repository'
import { InvoiceItemPaginationQuery } from './request'

@Injectable()
export class ApiInvoiceItemService {
  constructor(
    private readonly invoiceItemRepository: InvoiceItemRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly batchRepository: BatchRepository,
    private readonly productRepository: ProductRepository,
    private readonly procedureRepository: ProcedureRepository
  ) {}

  async pagination(oid: number, query: InvoiceItemPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query

    const { total, data } = await this.invoiceItemRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        type: filter?.type,
      },
      sort: sort || { id: 'DESC' },
    })

    const invoiceIds = uniqueArray(data.map((i) => i.invoiceId))
    const batchIds = uniqueArray(data.map((i) => i.batchId))
    const productIds = uniqueArray(data.map((i) => i.productId))
    const procedureIds = uniqueArray(data.map((i) => i.procedureId))

    const [invoices, batches, products, procedures] = await Promise.all([
      relation?.invoice && invoiceIds.length
        ? this.invoiceRepository.findMany({
            condition: { id: { IN: invoiceIds } },
            relation: { customer: !!relation?.invoice?.customer },
          })
        : <Invoice[]>[],
      relation?.batch && batchIds.length
        ? this.batchRepository.findMany({
            condition: { id: { IN: batchIds } },
          })
        : <Batch[]>[],
      relation?.product && productIds.length
        ? this.productRepository.findMany({
            condition: { id: { IN: productIds } },
          })
        : <Product[]>[],
      relation?.procedure && procedureIds.length
        ? this.procedureRepository.findManyBy({ id: { IN: procedureIds } })
        : <Procedure[]>[],
    ])

    data.forEach((ii: InvoiceItem) => {
      ii.batch = batches.find((item) => item.id === ii.batchId)
      ii.product = products.find((item) => item.id === ii.productId)
      ii.procedure = procedures.find((item) => item.id === ii.procedureId)
      ii.invoice = invoices.find((item) => item.id === ii.invoiceId)
    })

    return {
      data,
      meta: { page, limit, total },
    }
  }
}
