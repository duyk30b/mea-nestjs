import { InvoiceItemType } from '_libs/database/common/variable'

export interface InvoiceItemCriteria {
	id?: number
	oid?: number
	customerId?: number
	referenceId?: number
	type?: InvoiceItemType

	ids?: number[]
}

export type InvoiceItemOrder = {
	[P in 'id']?: 'ASC' | 'DESC'
}
