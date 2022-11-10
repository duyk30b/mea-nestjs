import { ComparisonType } from '_libs/database/common/base.dto'

export interface CustomerCriteria {
	id?: number
	oid?: number
	isActive?: boolean

	ids?: number[]

	fullNameEn?: string | [ComparisonType, string]
	phone?: string | [ComparisonType, string]
}

export type CustomerOrder = {
	[P in 'id' | 'debt' | 'fullNameEn']?: 'ASC' | 'DESC'
}
