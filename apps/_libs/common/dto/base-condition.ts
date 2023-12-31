export type ConditionAnd<T> = {
    [P in keyof T]?:
        | T[P]
        | ({
              [Q in '>' | 'GT' | '>=' | 'GTE' | '<' | 'LT' | '<=' | 'LTE' | '==' | 'EQUAL' | '!=' | 'NOT']?: T[P]
          } & {
              [Q in 'IS_NULL' | 'NOT_NULL']?: boolean
          } & {
              LIKE?: string
              IN?: T[P][]
              BETWEEN?: [T[P], T[P]]
              RAW_QUERY?: string
          })
        | ({
              [Q in '>' | 'GT' | '>=' | 'GTE' | '<' | 'LT' | '<=' | 'LTE' | '==' | 'EQUAL' | '!=' | 'NOT']?: T[P]
          } & {
              [Q in 'IS_NULL' | 'NOT_NULL']?: boolean
          } & {
              LIKE?: string
              IN?: T[P][]
              BETWEEN?: [T[P], T[P]]
              RAW_QUERY?: string
          })[]
}
export type ConditionType<T> = ConditionAnd<T> | ConditionAnd<T>[]

export const escapeSearch = (str = '') => {
    return str.toLowerCase().replace(/[?%\\_]/gi, (x) => '\\' + x)
}
