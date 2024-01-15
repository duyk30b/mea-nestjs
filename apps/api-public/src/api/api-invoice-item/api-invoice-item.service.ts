import { Injectable } from '@nestjs/common'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { InvoiceItemType } from '../../../../_libs/database/common/variable'
import { InvoiceItem } from '../../../../_libs/database/entities'
import {
    InvoiceItemRepository,
    InvoiceRepository,
    ProcedureRepository,
    ProductBatchRepository,
} from '../../../../_libs/database/repository'
import { InvoiceItemPaginationQuery } from './request'

@Injectable()
export class ApiInvoiceItemService {
    constructor(
        private readonly invoiceItemRepository: InvoiceItemRepository,
        private readonly invoiceRepository: InvoiceRepository,
        private readonly productBatchRepository: ProductBatchRepository,
        private readonly procedureRepository: ProcedureRepository
    ) {}

    async pagination(oid: number, query: InvoiceItemPaginationQuery) {
        const { page, limit, filter, relation, sort } = query

        const { total, data } = await this.invoiceItemRepository.pagination({
            page,
            limit,
            condition: {
                oid,
                customerId: filter?.customerId,
                referenceId: filter?.referenceId,
                type: filter?.type,
            },
            sort: sort || { id: 'DESC' },
        })

        const invoiceIds = uniqueArray(data.map((i) => i.invoiceId))
        const productBatchIds = uniqueArray(
            data.filter((i) => i.type === InvoiceItemType.ProductBatch).map((i) => i.referenceId)
        )
        const procedureIds = uniqueArray(
            data.filter((i) => i.type === InvoiceItemType.Procedure).map((i) => i.referenceId)
        )

        const [invoices, productBatches, procedures] = await Promise.all([
            relation?.invoice && invoiceIds.length
                ? this.invoiceRepository.findMany({
                      condition: { id: { IN: invoiceIds } },
                      relation: { customer: !!relation?.invoice?.customer },
                  })
                : [],
            relation?.productBatch && productBatchIds.length
                ? this.productBatchRepository.findMany({
                      condition: { id: { IN: productBatchIds } },
                      relation: { product: !!relation?.productBatch?.product },
                  })
                : [],
            relation?.procedure && procedureIds.length
                ? this.procedureRepository.findManyBy({ id: { IN: procedureIds } })
                : [],
        ])

        data.forEach((ii: InvoiceItem) => {
            ii.productBatch = productBatches.find((item) => {
                return ii.type === InvoiceItemType.ProductBatch && item.id === ii.referenceId
            })
            ii.procedure = procedures.find((item) => {
                return ii.type === InvoiceItemType.Procedure && item.id === ii.referenceId
            })
            ii.invoice = invoices.find((item) => item.id === ii.invoiceId)
        })

        return { page, limit, total, data }
    }
}
