export class DistributorPaymentCondition {
    id?: number
    oid?: number
    distributorId?: number

    ids?: number[]
}

export type DistributorPaymentOrder = {
    [P in 'id']?: 'ASC' | 'DESC'
}
