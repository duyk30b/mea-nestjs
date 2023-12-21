export class CustomerPaymentCondition {
    id?: number
    oid?: number
    customerId?: number

    ids?: number[]
}

export type CustomerPaymentOrder = {
    [P in 'id']?: 'ASC' | 'DESC'
}
