export interface ProcedureCondition {
    id?: number
    oid?: number
    group?: string
    isActive?: 0 | 1

    ids?: number[]

    searchText?: string
}

export type ProcedureOrder = {
    [P in 'id']?: 'ASC' | 'DESC'
}
