import { ArrivalType, PaymentStatus } from '_libs/database/common/variable'

export interface ArrivalCriteria {
	id?: number
	oid?: number
	customerId?: number
	type?: ArrivalType
	paymentStatus?: PaymentStatus

	ids?: number[]
	types?: ArrivalType[]

	fromTime?: number
	toTime?: number
}

export type ArrivalOrder = {
	[P in 'id']?: 'ASC' | 'DESC'
}
