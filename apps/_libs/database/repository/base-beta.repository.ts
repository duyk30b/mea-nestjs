// import { Repository } from 'typeorm'

// export type ConditionAnd<T> =
//     | {
//           [P in keyof T]?:
//               | T[P]
//               | ({
//                     [Q in '>' | 'GT' | '>=' | 'GTE' | '<' | 'LT' | '<=' | 'LTE' | '==' | 'EQUAL' | '!=' | 'NOT']?: T[P]
//                 } & {
//                     [Q in 'IS_NULL' | 'NOT_NULL']?: boolean
//                 } & {
//                     LIKE?: string
//                     IN?: T[P][]
//                     BETWEEN?: [T[P], T[P]]
//                 })
//               | ({
//                     [Q in '>' | 'GT' | '>=' | 'GTE' | '<' | 'LT' | '<=' | 'LTE' | '==' | 'EQUAL' | '!=' | 'NOT']?: T[P]
//                 } & {
//                     [Q in 'IS_NULL' | 'NOT_NULL']?: boolean
//                 } & {
//                     LIKE?: string
//                     IN?: T[P][]
//                     BETWEEN?: [T[P], T[P]]
//                 })[]
//       }
//     | { id: number }
// export type BaseCondition<T> = ConditionAnd<T> | ConditionAnd<T>[]
// export type BaseOrder<T> = {
//     [P in keyof T]?: 'ASC' | 'DESC'
// }

// export const escapeSearch = (str = '') => {
//     return str.toLowerCase().replace(/[?%\\_]/gi, (x) => '\\' + x)
// }

// export abstract class BaseRepository<T> {
//     private repository: Repository<T>
//     private _TABLE: string

//     protected constructor(repository: Repository<T>) {
//         this.repository = repository
//         this._TABLE = repository.target['name']
//     }

//     getRawCondition(condition: BaseCondition<T> | BaseCondition<T>[] = {}): string {
//         if (Object.keys(condition).length === 0) return ''
//         // Array: filter theo OR, Object filter theo AND

//         const generatedComparison = (property: string, typeCondition: Record<string, any>) => {
//             const generatedComparisonStr = Object.entries(typeCondition)
//                 .map(([type, value]) => {
//                     const valueConvert = typeof value === 'string' ? `'${value}'` : value

//                     switch (type) {
//                         case 'IN':
//                             const textIn = valueConvert.join(', ')
//                             return `"${property}" IN (${textIn})`
//                         case 'LIKE':
//                             const textLike = escapeSearch(value)
//                             return `"${property}" LIKE '%${textLike}%'`
//                         case 'BETWEEN':
//                             return `"${property}" BETWEEN ${value[0]} AND ${value[1]}`
//                         case 'GT':
//                         case '>':
//                             return `"${property}" > ${valueConvert}`
//                         case 'GTE':
//                         case '>=':
//                             return `"${property}" >= ${valueConvert}`
//                         case 'LT':
//                         case '<':
//                             return `"${property}" < ${valueConvert}`
//                         case 'LTE':
//                         case '<=':
//                             return `"${property}" <= ${valueConvert}`
//                         case 'EQUAL':
//                         case '==':
//                             return `"${property}" = ${valueConvert}`
//                         case 'NOT':
//                         case '!=':
//                             return `"${property}" != ${valueConvert}`
//                         case 'IS_NULL':
//                             return `"${property}" IS NULL`
//                         case 'NOT_NULL':
//                             return `"${property}" IS NOT NULL`
//                         default:
//                             return ''
//                     }
//                 })
//                 .filter((i) => !!i) // tầng thấp nhất thì ko cần .map((i) => `(${i})`)
//                 .join(' AND ')
//             return `(${generatedComparisonStr})`
//         }

//         const generatedProperty = (propertyCondition: BaseCondition<T>) => {
//             const generatedPropertyStr = Object.entries(propertyCondition) // tầng của các property khác nhau
//                 .map(([property, target]) => {
//                     if (['string'].includes(typeof target)) {
//                         const textEscape = escapeSearch(target)
//                         return `"${property}" = '${target}'`
//                     }
//                     if (['number'].includes(typeof target)) {
//                         return `"${property}" = ${target}`
//                     }
//                     if (typeof target === 'object') {
//                         // tầng của các condition khác nhau
//                         if (Object.keys(target).length === 0) return ''
//                         if (Array.isArray(target)) {
//                             const str = target
//                                 .map((i) => `${generatedComparison(property, i)}`)
//                                 .filter((i) => !!i)
//                                 .join(' OR ')
//                             return `(${str})`
//                         }
//                         if (typeof target === 'object') {
//                             const str = generatedComparison(property, target)
//                             return `(${str})`
//                         }
//                     }
//                 })
//                 .filter((i) => !!i)
//                 .join(' AND ')
//             return `(${generatedPropertyStr})`
//         }

//         // tầng ngoài cùng
//         let whereStr = ''
//         if (Array.isArray(condition)) {
//             whereStr = condition
//                 .map((conditionEach: BaseCondition<T>) => `${generatedProperty(conditionEach)}`)
//                 .filter((i) => !!i)
//                 .join(' OR ')
//         } else {
//             whereStr = generatedProperty(condition)
//         }
//         return whereStr
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
//         const data = await this.basicQuery({ condition: { id }, limit: 1 })
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
