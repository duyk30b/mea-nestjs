export class ProductMovementCondition {
	oid?: number
	productId?: number
	productBatchId?: number
}

export type ProductMovementOrder = {
	[P in 'id']?: 'ASC' | 'DESC'
}
