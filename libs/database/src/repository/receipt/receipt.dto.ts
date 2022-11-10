import { PaymentStatus } from '_libs/database/common/variable'

export interface ReceiptCriteria {
	id?: number
	oid?: number
	distributorId?: number
	paymentStatus?: PaymentStatus
	purchaseId?: number

	ids?: number[]
	distributorIds?: number[]
	purchaseIds?: number[]
	paymentStatuses?: PaymentStatus[]

	fromTime?: number
	toTime?: number
}

export type ReceiptOrder = {
	[P in 'id']?: 'ASC' | 'DESC'
}
