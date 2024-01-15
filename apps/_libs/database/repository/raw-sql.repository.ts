// import { Repository } from 'typeorm'

// export type BaseCondition<T> = {
//     [P in keyof T]?:
//         | T[P]
//         | ({
//               [Q in '>' | 'GT' | '>=' | 'GTE' | '<' | 'LT' | '<=' | 'LTE' | '==' | 'EQUAL' | '!=' | 'NOT']?: T[P]
//           } & {
//               [Q in 'IS_NULL' | 'NOT_NULL']?: boolean
//           } & {
//               LIKE?: string
//               IN?: T[P][]
//               BETWEEN?: [T[P], T[P]]
//           })
// } & { $OR?: BaseCondition<T>[] }

// export type BaseOrder<T> = {
//     [P in keyof T]?: 'ASC' | 'DESC'
// }

// export const escapeSearch = (str = '') => {
//     return str.toLowerCase().replace(/[?%\\_]/gi, (x) => '\\' + x)
// }

// export abstract class RawSqlRepository<T> {
//     private repository: Repository<T>
//     private _TABLE: string

//     protected constructor(repository: Repository<T>) {
//         this.repository = repository
//         this._TABLE = repository.target['name']
//     }

//     getRawCondition(condition: BaseCondition<T> = {}): string {
//         const conditionAnd = []
//         Object.keys(condition).forEach((property) => {
//             const target = condition[property]
//             if (property === '$OR' && Array.isArray(target)) {
//                 const conditionOr = target.map((c) => this.getRawCondition(c))
//                 const conditionOrString = conditionOr.filter((i) => !!i).join(' OR ')
//                 if (conditionOrString) {
//                     return conditionAnd.push(`(${conditionOrString})`)
//                 }
//             }
//             if (target == null) return ''
//             if (['string'].includes(typeof target)) {
//                 const textEscape = escapeSearch(target)
//                 return conditionAnd.push(`"${property}" = '${textEscape}'`)
//             }
//             if (['number'].includes(typeof target)) {
//                 return conditionAnd.push(`"${property}" = ${target}`)
//             }
//             if (typeof target === 'object') {
//                 Object.keys(target).forEach((type) => {
//                     const valueRoot = target[type]
//                     const value = typeof valueRoot === 'string' ? `'${escapeSearch(valueRoot)}'` : valueRoot
//                     switch (type) {
//                         case 'IN':
//                             const textIn = value.join(', ')
//                             return conditionAnd.push(`"${property}" IN (${textIn})`)
//                         case 'LIKE':
//                             return conditionAnd.push(`"${property}" LIKE '%${escapeSearch(valueRoot)}%'`)
//                         case 'BETWEEN':
//                             return conditionAnd.push(`"${property}" BETWEEN ${value[0]} AND ${value[1]}`)
//                         case 'GT':
//                         case '>':
//                             return conditionAnd.push(`"${property}" > ${value}`)
//                         case 'GTE':
//                         case '>=':
//                             return conditionAnd.push(`"${property}" >= ${value}`)
//                         case 'LT':
//                         case '<':
//                             return conditionAnd.push(`"${property}" < ${value}`)
//                         case 'LTE':
//                         case '<=':
//                             return conditionAnd.push(`"${property}" <= ${value}`)
//                         case 'EQUAL':
//                         case '==':
//                             return conditionAnd.push(`"${property}" = ${value}`)
//                         case 'NOT':
//                         case '!=':
//                             return conditionAnd.push(`"${property}" != ${value}`)
//                         case 'IS_NULL':
//                             return conditionAnd.push(`"${property}" IS NULL`)
//                         case 'NOT_NULL':
//                             return conditionAnd.push(`"${property}" IS NOT NULL`)
//                         default:
//                             return
//                     }
//                 })
//             }
//         })
//         return conditionAnd.filter((i) => !!i).join(' AND ')
//     }

//     getRawOrder(order: BaseOrder<T> = {}) {
//         if (Object.keys(order).length === 0) return ''
//         return Object.entries(order)
//             .map(([property, value]) => {
//                 if (!value) return ''
//                 return `"${property}" ${value}`
//             })
//             .filter((i) => !!i)
//             .join(', ')
//     }

//     async basicQuery(options: {
//         condition: BaseCondition<T>
//         order?: BaseOrder<T>
//         limit?: number
//         offset?: number
//     }): Promise<T[]> {
//         const { condition, order, limit, offset } = options
//         let rawQuery = `SELECT * FROM "${this._TABLE}"`

//         const rawCondition = this.getRawCondition(condition)
//         const rawOrder = this.getRawOrder(order)

//         if (rawCondition) rawQuery += ` WHERE ${rawCondition}`
//         if (rawOrder) rawQuery += ` ORDER BY ${rawOrder}`
//         if (limit) rawQuery += ` LIMIT ${limit}`
//         if (offset) rawQuery += ` OFFSET ${offset}`

//         return await this.repository.query(rawQuery)
//     }

//     async basicCount(condition: BaseCondition<T>) {
//         let rawQuery = `SELECT COUNT(*) FROM "${this._TABLE}"`

//         const rawCondition = this.getRawCondition(condition)
//         if (rawCondition) rawQuery += ` WHERE ${rawCondition}`

//         const result = await this.repository.query(rawQuery)
//         return Number(result[0].count)
//     }

//     async pagination(options: { condition: BaseCondition<T>; order?: BaseOrder<T>; limit: number; page: number }) {
//         const { condition, order, limit, page } = options
//         const offset = (page - 1) * limit
//         const [data, total] = await Promise.all([
//             this.basicQuery({ condition, order, limit, offset }),
//             this.basicCount(condition),
//         ])
//         return { data, total, page, limit }
//     }

//     async findOne(options: { condition: BaseCondition<T>; order?: BaseOrder<T> }): Promise<T> {
//         const { condition, order } = options
//         const data = await this.basicQuery({ condition, order, limit: 1 })
//         return data[0]
//     }

//     async findOneBy(condition: BaseCondition<T>): Promise<T> {
//         const data = await this.basicQuery({ condition, limit: 1 })
//         return data[0]
//     }

//     async findOneById(id: number): Promise<T> {
//         const data = await this.basicQuery({ condition: { id }, limit: 1 } as any)
//         return data[0]
//     }

//     async findMany(options: { condition: BaseCondition<T>; order?: BaseOrder<T>; limit?: number }): Promise<T[]> {
//         const { condition, order, limit } = options
//         return await this.basicQuery({ condition, order, limit })
//     }

//     async findManyBy(condition: BaseCondition<T>): Promise<T[]> {
//         return await this.basicQuery({ condition })
//     }
// }
