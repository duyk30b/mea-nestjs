import { ComparisonType } from '../../common/base.dto'

export class DistributorCondition {
    oid?: number
    id?: number
    isActive?: 0 | 1

    ids?: number[]

    fullName?: string | [ComparisonType, string]
    phone?: string | [ComparisonType, string]
}

export type DistributorOrder = {
    id?: 'ASC' | 'DESC'
    debt?: 'ASC' | 'DESC'
    fullName?: 'ASC' | 'DESC'
}
