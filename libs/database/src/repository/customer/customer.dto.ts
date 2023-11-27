import { ComparisonType } from '_libs/database/common/base.dto'

export interface CustomerCondition {
    id?: number
    oid?: number
    isActive?: boolean

    ids?: number[]

    fullName?: string | [ComparisonType, string]
    phone?: string | [ComparisonType, string]

    debt?: [ComparisonType, number]
}

export type CustomerOrder = {
    [P in 'id' | 'debt' | 'fullName']?: 'ASC' | 'DESC'
}
