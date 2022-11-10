import { ComparisonType } from '_libs/database/common/base.dto'

export interface ProcedureCriteria {
	id?: number
	oid?: number
	group?: string
	isActive?: boolean

	ids?: number[]

	searchText?: string
}

export type ProcedureOrder = {
	[P in 'id']?: 'ASC' | 'DESC'
}
