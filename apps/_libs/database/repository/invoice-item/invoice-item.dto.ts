import { InvoiceItemType } from '../../common/variable'

export interface InvoiceItemCondition {
    id?: number
    oid?: number
    customerId?: number
    referenceId?: number
    type?: InvoiceItemType

    ids?: number[]
}

export type InvoiceItemOrder = {
    [P in 'id']?: 'ASC' | 'DESC'
}
