export class ProductCriteria {
	id?: number
	oid?: number
	group?: string
	isActive?: boolean

	ids?: number[]

	searchText?: string
}

export type ProductOrder = {
	[P in 'id' | 'brandName']?: 'ASC' | 'DESC'
}
