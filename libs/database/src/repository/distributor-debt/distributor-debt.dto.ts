export class DistributorDebtCriteria {
	id?: number
	oid?: number
	distributorId?: number

	ids?: number[]
}

export type DistributorDebtOrder = {
	[P in 'id']?: 'ASC' | 'DESC'
}
