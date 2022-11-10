export class ProductMovementCriteria {
	oid?: number
	productId?: number
	productBatchId?: number
}

export type ProductMovementOrder = {
	[P in 'id']?: 'ASC' | 'DESC'
}
