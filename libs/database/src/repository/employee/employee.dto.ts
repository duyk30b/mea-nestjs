import { ComparisonType } from '_libs/database/common/base.dto'

export class EmployeeCriteria {
	oid?: number
	id?: number

	ids?: number[]

	fullNameEn?: string | [ComparisonType, string]
	phone?: string | [ComparisonType, string]
}

export type EmployeeOrder = {
	[P in 'id']?: 'ASC' | 'DESC'
}
