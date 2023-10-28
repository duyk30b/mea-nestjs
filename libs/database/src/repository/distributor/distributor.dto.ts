import { ComparisonType } from '_libs/database/common/base.dto'

export class DistributorCondition {
	oid?: number
	id?: number
	isActive?: boolean

	ids?: number[]

	fullName?: string | [ComparisonType, string]
	phone?: string | [ComparisonType, string]
}

export type DistributorOrder = {
	id?: 'ASC' | 'DESC'
	debt?: 'ASC' | 'DESC'
	fullName?: 'ASC' | 'DESC'
}
