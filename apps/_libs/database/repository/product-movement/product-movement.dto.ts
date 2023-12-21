import { ProductMovementType } from '../../entities/product-movement.entity'

export class ProductMovementCondition {
    oid?: number
    productId?: number
    productBatchId?: number
    type?: ProductMovementType
}

export type ProductMovementOrder = {
    [P in 'id']?: 'ASC' | 'DESC'
}
