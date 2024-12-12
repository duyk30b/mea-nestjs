// import { FindOptionsOrder, FindOptionsRelations, Repository } from 'typeorm'
// import { NoExtra } from '../../common/helpers/typescript.helper'

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

// export abstract class BaseRawSqlRepository<
//     _ENTITY,
//     _SORT = { [P in keyof _ENTITY]?: 'ASC' | 'DESC' },
//     _RELATION = { [P in keyof _ENTITY]?: boolean },
// > {
//     private repository: Repository<_ENTITY>

//     protected constructor(repository: Repository<_ENTITY>) {
//         this.repository = repository
//     }

//     getRawCondition(condition: BaseCondition<_ENTITY> = {}): string {
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

//     getWhereOptions(conditions: BaseCondition<_ENTITY> = {}) {
//         return this.getRawCondition(conditions)
//     }

//     // async pagination<S extends _SORT, R extends _RELATION>(options: {
//     //     page: number
//     //     limit: number
//     //     condition?: BaseCondition<_ENTITY>
//     //     sort?: NoExtra<_SORT, S>
//     //     relation?: NoExtra<_RELATION, R>
//     //     relationLoadStrategy?: 'query' | 'join'
//     // }) {
//     //     const { limit, page, condition } = options
//     //     const where = this.getWhereOptions(condition)
//     //     const query = this.repository.createQueryBuilder().where(where)
//     //     const order = options.sort as FindOptionsOrder<_ENTITY>
//     //     const relations = options.relation as FindOptionsRelations<_ENTITY>

//     //     const [data, total] = await this.repository.findAndCount({
//     //         relations,
//     //         relationLoadStrategy: options.relationLoadStrategy || 'query', // dùng join bị lỗi 2 câu query
//     //         where,
//     //         order,
//     //         take: limit,
//     //         skip: (page - 1) * limit,
//     //     })

//     //     return { total, page, limit, data }
//     // }

//     // async findMany<S extends _SORT, R extends _RELATION>(options: {
//     //     condition: BaseCondition<_ENTITY>
//     //     limit?: number
//     //     sort?: NoExtra<_SORT, S>
//     //     relation?: NoExtra<_RELATION, R>
//     //     relationLoadStrategy?: 'query' | 'join'
//     // }): Promise<_ENTITY[]> {
//     //     const where = this.getWhereOptions(options.condition)
//     //     const order = options.sort as FindOptionsOrder<_ENTITY>
//     //     const relations = options.relation as FindOptionsRelations<_ENTITY>

//     //     return await this.repository.find({
//     //         relations,
//     //         relationLoadStrategy: options.relationLoadStrategy || 'query',
//     //         where,
//     //         take: options.limit,
//     //         order,
//     //     })
//     // }

//     // async findManyBy(condition: BaseCondition<_ENTITY>): Promise<_ENTITY[]> {
//     //     const where = this.getWhereOptions(condition)
//     //     return await this.repository.findBy(where)
//     // }

//     // async findManyByIds(ids: number[]): Promise<_ENTITY[]> {
//     //     return await this.findManyBy({ id: { IN: ids } } as any)
//     // }

//     // async findOne<S extends _SORT, R extends _RELATION>(options: {
//     //     condition: BaseCondition<_ENTITY>
//     //     sort?: NoExtra<_SORT, S>
//     //     relation?: NoExtra<_RELATION, R>
//     //     relationLoadStrategy?: 'query' | 'join'
//     // }): Promise<_ENTITY> {
//     //     const where = this.getWhereOptions(options.condition)
//     //     const order = options.sort as FindOptionsOrder<_ENTITY>
//     //     const relations = options.relation as FindOptionsRelations<_ENTITY>

//     //     return await this.repository.findOne({
//     //         relations,
//     //         relationLoadStrategy: options.relationLoadStrategy || 'join',
//     //         where,
//     //         order,
//     //     })
//     // }

//     // async findOneBy(condition: BaseCondition<_ENTITY>): Promise<_ENTITY> {
//     //     const where = this.getWhereOptions(condition)
//     //     return await this.repository.findOne({ where })
//     //     return await this.repository.findOneBy(where)
//     // }

//     // async findOneById(id: number): Promise<_ENTITY> {
//     //     return await this.findOneBy({ id } as any)
//     // }

//     async insertMany<X extends Partial<Omit<_ENTITY, 'id'>>>(
//         data: NoExtra<Partial<Omit<_ENTITY, 'id'>>, X>[]
//     ): Promise<number[]> {
//         const insertResult = await this.repository.insert(data)
//         return insertResult.identifiers.map((i) => i.id)
//     }

//     async insertManyFullField<X extends Omit<_ENTITY, 'id'>>(
//         data: NoExtra<Omit<_ENTITY, 'id'>, X>[]
//     ): Promise<number[]> {
//         const insertResult = await this.repository.insert(data)
//         return insertResult.identifiers.map((i) => i.id)
//     }

//     async insertOne<X extends Partial<Omit<_ENTITY, 'id'>>>(
//         data: NoExtra<Partial<Omit<_ENTITY, 'id'>>, X>
//     ): Promise<number> {
//         const insertResult = await this.repository.insert(data)
//         return insertResult.identifiers[0].id
//     }

//     async insertOneFullField<X extends Omit<_ENTITY, 'id'>>(data: NoExtra<Omit<_ENTITY, 'id'>, X>): Promise<number> {
//         const insertResult = await this.repository.insert(data)
//         return insertResult.identifiers[0].id
//     }

//     async update<X extends Partial<Omit<_ENTITY, 'id' | 'oid'>>>(
//         condition: BaseCondition<_ENTITY>,
//         data: NoExtra<Partial<Omit<_ENTITY, 'id' | 'oid'>>, X>
//     ): Promise<number> {
//         const where = this.getWhereOptions(condition)
//         const updateResult = await this.repository.update(where, data)
//         return updateResult.affected
//     }

//     async delete(condition: BaseCondition<_ENTITY>) {
//         const where = this.getWhereOptions(condition)
//         const updateResult = await this.repository.update(where, { deletedAt: Date.now() } as any)
//         return updateResult.affected
//     }
// }
