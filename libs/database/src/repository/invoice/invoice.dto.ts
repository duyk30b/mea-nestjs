import { PaymentStatus } from '_libs/database/common/variable'

export interface InvoiceCriteria {
	id?: number
	oid?: number
	customerId?: number
	paymentStatus?: PaymentStatus
	arrivalId?: number

	ids?: number[]
	customerIds?: number[]
	arrivalIds?: number[]
	paymentStatuses?: PaymentStatus[]

	fromTime?: number
	toTime?: number
}

export type InvoiceOrder = {
	[P in 'id']?: 'ASC' | 'DESC'
}
