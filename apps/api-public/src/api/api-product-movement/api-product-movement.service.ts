import { Injectable } from '@nestjs/common'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { ProductMovement } from '../../../../_libs/database/entities'
import { ProductMovementType } from '../../../../_libs/database/entities/product-movement.entity'
import {
    InvoiceRepository,
    ProductBatchRepository,
    ProductMovementRepository,
    ReceiptRepository,
} from '../../../../_libs/database/repository'
import { ProductMovementPaginationQuery } from './request'

@Injectable()
export class ApiProductMovementService {
    constructor(
        private readonly productMovementRepository: ProductMovementRepository,
        private readonly productBatchRepository: ProductBatchRepository,
        private readonly invoiceRepository: InvoiceRepository,
        private readonly receiptRepository: ReceiptRepository
    ) {}

    async pagination(oid: number, query: ProductMovementPaginationQuery) {
        const { total, page, limit, data } = await this.productMovementRepository.pagination({
            page: query.page,
            limit: query.limit,
            condition: {
                oid,
                productId: query.filter?.productId,
                productBatchId: query.filter?.productBatchId,
                type: query.filter?.type,
            },
            sort: query.sort || { id: 'DESC' },
        })

        const invoiceIds = data.filter((i) => i.type === ProductMovementType.Invoice).map((i) => i.referenceId)
        const receiptIds = data.filter((i) => i.type === ProductMovementType.Receipt).map((i) => i.referenceId)
        const productBatchIds = data.map((i) => i.productBatchId)

        const [invoices, receipts, productBatches] = await Promise.all([
            invoiceIds.length
                ? this.invoiceRepository.findMany({
                      condition: { id: { IN: uniqueArray(invoiceIds) } },
                      relation: { customer: true },
                  })
                : [],
            receiptIds.length
                ? this.receiptRepository.findMany({
                      condition: { id: { IN: uniqueArray(receiptIds) } },
                      relation: { distributor: true },
                  })
                : [],
            productBatchIds.length
                ? this.productBatchRepository.findMany({
                      condition: { id: { IN: uniqueArray(productBatchIds) } },
                      relation: { product: false },
                  })
                : [],
        ])

        data.forEach((mov: ProductMovement) => {
            mov.productBatch = productBatches.find((pb) => pb.id === mov.productBatchId)
            if (mov.type === ProductMovementType.Invoice) {
                mov.invoice = invoices.find((iv) => iv.id === mov.referenceId)
            } else if (mov.type === ProductMovementType.Receipt) {
                mov.receipt = receipts.find((rc) => rc.id === mov.referenceId)
            }
        })

        return { total, page, limit, data }
    }
}
