import { ComparisonType } from '_libs/database/common/base.dto'

export class ProductBatchCondition {
    id?: number
    oid?: number
    productId?: number
    isActive?: boolean

    ids?: number[]
    productIds?: number[]

    quantity?: [ComparisonType, number?]
    expiryDate?: [ComparisonType, Date?]
}

export type ProductBatchOrder = {
    [P in 'id' | 'expiryDate']?: 'ASC' | 'DESC'
}
