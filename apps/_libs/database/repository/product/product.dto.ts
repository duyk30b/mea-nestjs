import { ComparisonType } from '../../common/base.dto'

export class ProductCondition {
    id?: number
    oid?: number
    group?: string
    isActive?: 0 | 1

    ids?: number[]

    searchText?: string
    quantity?: [ComparisonType, number?]
}

export type ProductOrder = {
    [P in 'id' | 'brandName' | 'quantity']?: 'ASC' | 'DESC'
}
