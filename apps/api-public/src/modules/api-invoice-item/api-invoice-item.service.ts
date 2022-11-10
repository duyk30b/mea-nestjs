import { Injectable } from '@nestjs/common'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { InvoiceItemType } from '_libs/database/common/variable'
import { InvoiceItem } from '_libs/database/entities'
import { InvoiceItemRepository, InvoiceRepository, ProcedureRepository, ProductBatchRepository } from '_libs/database/repository'
import { InvoiceItemPaginationQuery } from './request'

@Injectable()
export class ApiInvoiceItemService {
	constructor(
		private readonly invoiceItemRepository: InvoiceItemRepository,
		private readonly invoiceRepository: InvoiceRepository,
		private readonly productBatchRepository: ProductBatchRepository,
		private readonly procedureRepository: ProcedureRepository
	) { }

	async pagination(oid: number, query: InvoiceItemPaginationQuery) {
		const { page, limit, filter, relations, sort } = query
		console.log('🚀 ~ file: api-invoice-item.service.ts:19 ~ ApiInvoiceItemService ~ pagination ~ query:', query)

		const { total, data } = await this.invoiceItemRepository.pagination({
			page,
			limit,
			criteria: {
				oid,
				customerId: filter?.customerId,
				referenceId: filter?.referenceId,
				type: filter?.type,
			},
			order: sort || { id: 'DESC' },
		})

		const invoiceIds = uniqueArray(data.map((i) => i.invoiceId))
		const productBatchIds = uniqueArray(data.filter((i) => i.type === InvoiceItemType.ProductBatch)
			.map((i) => i.referenceId))
		const procedureIds = uniqueArray(data.filter((i) => i.type === InvoiceItemType.Procedure)
			.map((i) => i.referenceId))

		const [invoices, productBatches, procedures] = await Promise.all([
			relations?.invoice && invoiceIds.length
				? this.invoiceRepository.findMany(
					{ ids: invoiceIds },
					{ customer: !!relations?.invoice?.customer }
				) : [],
			relations?.productBatch && productBatchIds.length
				? this.productBatchRepository.findMany(
					{ ids: productBatchIds },
					{ product: !!relations?.productBatch?.product }
				) : [],
			relations?.procedure && procedureIds.length
				? this.procedureRepository.findMany({ ids: procedureIds }) : [],
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
