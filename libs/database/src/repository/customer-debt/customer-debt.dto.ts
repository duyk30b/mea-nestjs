export class CustomerDebtCriteria {
	id?: number
	oid?: number
	customerId?: number

	ids?: number[]
}

export type CustomerDebtOrder = {
	[P in 'id']?: 'ASC' | 'DESC'
}
