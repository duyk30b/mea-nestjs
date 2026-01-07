export type BaseCondition<T> = {
  [P in keyof T]?:
  | T[P]
  | ({
    [Q in
    | '>'
    | 'GT'
    | '>='
    | 'GTE'
    | '<'
    | 'LT'
    | '<='
    | 'LTE'
    | '=='
    | 'EQUAL'
    | '!='
    | 'NOT']?: T[P]
  } & {
    [Q in 'IS_NULL' | 'NOT_NULL']?: boolean
  } & {
    LIKE?: string
    IN?: T[P][]
    NOT_IN?: T[P][]
    BETWEEN?: [T[P], T[P]]
    NOT_BETWEEN?: [T[P], T[P]]
    RAW_QUERY?: string
  })
} & { $OR?: BaseCondition<T>[]; $AND?: BaseCondition<T>[] }

export type BaseOperator<T> = {
  ADD?: (T | BaseOperator<T> | number)[]
  SUB?: (T | BaseOperator<T> | number)[]
  MUL?: (T | BaseOperator<T> | number)[]
  DIV?: (T | BaseOperator<T> | number)[]
}

export const escapeSearch = (str = '') => {
  return str.replace(/[?%\\_]/gi, (x) => '\\' + x)
}
