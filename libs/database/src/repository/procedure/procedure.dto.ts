export interface ProcedureCondition {
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
