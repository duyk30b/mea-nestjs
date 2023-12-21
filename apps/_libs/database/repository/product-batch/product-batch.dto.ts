import { ComparisonType } from '../../common/base.dto'

export class ProductBatchCondition {
    id?: number
    oid?: number
    productId?: number
    isActive?: 0 | 1

    ids?: number[]
    productIds?: number[]

    quantity?: [ComparisonType, number?]
    expiryDate?: [ComparisonType, Date?]
}

export type ProductBatchOrder = {
    [P in 'id' | 'expiryDate']?: 'ASC' | 'DESC'
}
