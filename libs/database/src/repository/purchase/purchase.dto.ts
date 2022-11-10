import { PaymentStatus } from '_libs/database/common/variable'

export interface PurchaseCriteria {
	id?: number
	oid?: number
	distributorId?: number
	paymentStatus?: PaymentStatus

	ids?: number[]
	distributorIds?: number[]

	fromTime?: number
	toTime?: number
}

export type PurchaseOrder = {
	[P in 'id']?: 'ASC' | 'DESC'
}
