import { Repository } from 'typeorm'
import { escapeSearch } from '../common/base.dto'

export type ConditionAnd<T> = {
    [P in keyof T]?:
        | T[P]
        | ({ [Q in '>' | 'GT' | '>=' | 'GTE' | '<' | 'LT' | '<=' | 'LTE' | '==' | 'EQUAL' | '!=' | 'NOT']?: T[P] } & {
              [Q in 'IS_NULL' | 'NOT_NULL']?: boolean
          } & {
              LIKE?: string
              IN?: T[P][]
              BETWEEN?: [T[P], T[P]]
          })
        | ({ [Q in '>' | 'GT' | '>=' | 'GTE' | '<' | 'LT' | '<=' | 'LTE' | '==' | 'EQUAL' | '!=' | 'NOT']?: T[P] } & {
              [Q in 'IS_NULL' | 'NOT_NULL']?: boolean
          } & {
              LIKE?: string
              IN?: T[P][]
              BETWEEN?: [T[P], T[P]]
          })[]
}
export type BaseCondition<T> = ConditionAnd<T> | ConditionAnd<T>[]
export type BaseOrder<T> = {
    [P in keyof T]?: 'ASC' | 'DESC'
}

export abstract class BaseRepository<T> {
    private repository: Repository<T>

    protected constructor(repository: Repository<T>) {
        this.repository = repository
    }

    getRawCondition(condition: BaseCondition<T> | BaseCondition<T>[]) {
        if (Object.keys(condition).length === 0) return
        // Array: filter theo OR, Object filter theo AND

        const generatedComparison = (property: string, typeCondition: Record<string, any>) => {
            const generatedComparisonStr = Object.entries(typeCondition)
                .map(([type, value]) => {
                    const valueConvert = typeof value === 'string' ? `'${value}'` : value

                    switch (type) {
                        case 'IN':
                            const textIn = valueConvert.join(', ')
                            return `${property} IN (${textIn})`
                        case 'LIKE':
                            const textLike = escapeSearch(value)
                            return `${property} LIKE '%${textLike}%'`
                        case 'BETWEEN':
                            return `${property} BETWEEN ${value[0]} AND ${value[1]}`
                        case 'GT':
                        case '>':
                            return `${property} > ${valueConvert}`
                        case 'GTE':
                        case '>=':
                            return `${property} >= ${valueConvert}`
                        case 'LT':
                        case '<':
                            return `${property} < ${valueConvert}`
                        case 'LTE':
                        case '<=':
                            return `${property} <= ${valueConvert}`
                        case 'EQUAL':
                        case '==':
                            return `${property} = ${valueConvert}`
                        case 'NOT':
                        case '!=':
                            return `${property} != ${valueConvert}`
                        case 'IS_NULL':
                            return `${property} IS NULL`
                        case 'NOT_NULL':
                            return `${property} IS NOT NULL`
                        default:
                            return ''
                    }
                })
                .filter((i) => i !== '') // tầng thấp nhất thì ko cần .map((i) => `(${i})`)
                .join(' AND ')
            return `(${generatedComparisonStr})`
        }

        const generatedProperty = (propertyCondition: BaseCondition<T>) => {
            const generatedPropertyStr = Object.entries(propertyCondition) // tầng của các property khác nhau
                .map(([property, target]) => {
                    if (['string'].includes(typeof target)) {
                        return `${property} = '${target}'`
                    }
                    if (['number'].includes(typeof target)) {
                        return `${property} = ${target}`
                    }
                    if (typeof target === 'object') {
                        // tầng của các condition khác nhau
                        if (Object.keys(target).length === 0) return ''
                        if (Array.isArray(target)) {
                            const str = target
                                .map((i) => `${generatedComparison(property, i)}`)
                                .filter((i) => i !== '')
                                .join(' OR ')
                            return `(${str})`
                        }
                        if (typeof target === 'object') {
                            const str = generatedComparison(property, target)
                            return `(${str})`
                        }
                    }
                })
                .filter((i) => i !== '')
                .join(' AND ')
            return `(${generatedPropertyStr})`
        }

        // tầng ngoài cùng
        if (Array.isArray(condition)) {
            return condition
                .map((conditionEach) => `${generatedProperty(conditionEach)}`)
                .filter((i) => i !== '')
                .join(' OR ')
        } else {
            return generatedProperty(condition)
        }
    }

    async pagination(options: { page: number; limit: number; condition?: BaseCondition<T>; order?: BaseOrder<T> }) {
        const { limit, page, condition, order } = options
        const rawCondition = this.getRawCondition(condition)

        const [data, total] = await this.repository
            .createQueryBuilder()
            .where(rawCondition)
            .take(limit)
            .skip((page - 1) * limit)
            .getManyAndCount()

        return { total, page, limit, data }
    }

    async findOneBy(condition: BaseCondition<T>): Promise<T> {
        const rawCondition = this.getRawCondition(condition)
        return await this.repository.createQueryBuilder().where(rawCondition).getOne()
    }

    async findManyBy(condition: BaseCondition<T>): Promise<T[]> {
        const rawCondition = this.getRawCondition(condition)
        return await this.repository.createQueryBuilder().where(rawCondition).getMany()
    }
}
