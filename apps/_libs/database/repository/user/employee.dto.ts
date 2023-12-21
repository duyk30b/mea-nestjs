import { ComparisonType } from '../../common/base.dto'

export class EmployeeCondition {
    oid?: number
    id?: number

    ids?: number[]

    fullName?: string | [ComparisonType, string]
    phone?: string | [ComparisonType, string]
}

export type EmployeeOrder = {
    [P in 'id']?: 'ASC' | 'DESC'
}
