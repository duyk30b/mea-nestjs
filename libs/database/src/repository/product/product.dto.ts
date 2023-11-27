import { ComparisonType } from '_libs/database/common/base.dto'

export class ProductCondition {
    id?: number
    oid?: number
    group?: string
    isActive?: boolean

    ids?: number[]

    searchText?: string
    quantity?: [ComparisonType, number?]
}

export type ProductOrder = {
    [P in 'id' | 'brandName' | 'quantity']?: 'ASC' | 'DESC'
}
