import { ComparisonType } from '_libs/database/common/base.dto'

export class DistributorCriteria {
	oid?: number
	id?: number
	isActive?: boolean

	ids?: number[]

	fullNameEn?: string | [ComparisonType, string]
	phone?: string | [ComparisonType, string]
}

export type DistributorOrder = {
	id?: 'ASC' | 'DESC'
	debt?: 'ASC' | 'DESC'
	fullNameEn?: 'ASC' | 'DESC'
}
