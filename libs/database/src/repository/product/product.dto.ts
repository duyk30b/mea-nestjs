export class ProductCondition {
	id?: number
	oid?: number
	group?: string
	isActive?: boolean

	ids?: number[]

	searchText?: string
}

export type ProductOrder = {
	[P in 'id' | 'brandName' | 'quantity']?: 'ASC' | 'DESC'
}
