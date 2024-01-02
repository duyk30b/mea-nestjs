import {
    And,
    Between,
    Equal,
    FindOptionsOrder,
    FindOptionsRelations,
    FindOptionsWhere,
    In,
    IsNull,
    LessThan,
    LessThanOrEqual,
    Like,
    MoreThan,
    Not,
    Raw,
    Repository,
    UpdateResult,
} from 'typeorm'

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
export type BaseCondition<T> = ConditionAnd<T> | ConditionAnd<T>[]

export type Impossible<K extends keyof any> = {
    [P in K]: never
}
export type NoExtra<T, U extends T = T> = U & Impossible<Exclude<keyof U, keyof T>>

export abstract class BaseRepository<
    _ENTITY,
    _SORT = { [P in keyof _ENTITY]?: 'ASC' | 'DESC' },
    _RELATION = { [P in keyof _ENTITY]?: boolean },
> {
    private repository: Repository<_ENTITY>

    protected constructor(repository: Repository<_ENTITY>) {
        this.repository = repository
    }

    getConditionsAnd(conditions: ConditionAnd<_ENTITY> = {}) {
        const where: FindOptionsWhere<_ENTITY> = {}
        Object.entries(conditions).forEach(([column, target]: [string, any]) => {
            if (['number', 'string', 'boolean'].includes(typeof target)) {
                return (where[column] = target)
            }
            if (target === null) {
                return (where[column] = IsNull())
            }

            if (typeof target === 'object') {
                if (Object.keys(target).length === 0) return
                if (Array.isArray(target)) {
                    return // TODO: trường hợp này typeORM chưa xử lý được, dùng RAW_QUERY thay thế
                }
                if (typeof target === 'object') {
                    const listOperator = Object.entries(target).map(([rule, value]: [string, any]) => {
                        if (rule === '>' || rule === 'GT') {
                            return MoreThan(value)
                        }
                        if (rule === '>=' || rule === 'GTE') {
                            return MoreThan(value)
                        }
                        if (rule === '<' || rule === 'LT') {
                            return LessThan(value)
                        }
                        if (rule === '<=' || rule === 'LTE') {
                            return LessThanOrEqual(value)
                        }
                        if (rule === '==' || rule === 'EQUAL') {
                            return Equal(value)
                        }
                        if (rule === '!=' || rule === 'NOT') {
                            return Not(value)
                        }
                        if (rule === 'IS_NULL') {
                            if (value === true) return IsNull()
                            if (value === false) return Not(IsNull())
                        }
                        if (rule === 'NOT_NULL') {
                            if (value === true) return Not(IsNull())
                            if (value === false) return IsNull()
                        }
                        if (rule === 'BETWEEN') {
                            return Between(value[0], value[1])
                        }
                        if (rule === 'IN') {
                            if (value.length === 0) return IsNull()
                            return In(value)
                        }
                        if (rule === 'LIKE') {
                            return Like(value)
                        }
                        if (rule === 'RAW_QUERY') {
                            return Raw((alias) => `(${value})`)
                        }
                    })
                    where[column] = And(...listOperator)
                }
            }
        })
        return where
    }

    getWhereOptions(conditions: BaseCondition<_ENTITY> = {}) {
        if (Array.isArray(conditions)) {
            return conditions.map((c) => this.getConditionsAnd(c))
        }
        return this.getConditionsAnd(conditions)
    }

    async pagination(options: {
        page: number
        limit: number
        condition?: BaseCondition<_ENTITY>
        sort?: _SORT
        relation?: _RELATION
        relationLoadStrategy?: 'query' | 'join'
    }) {
        const { limit, page, condition } = options
        const where = this.getWhereOptions(condition)
        const order = options.sort as FindOptionsOrder<_ENTITY>
        const relations = options.relation as FindOptionsRelations<_ENTITY>

        const [data, total] = await this.repository.findAndCount({
            relations,
            relationLoadStrategy: options.relationLoadStrategy || 'query', // dùng join bị lỗi 2 câu query
            where,
            order,
            take: limit,
            skip: (page - 1) * limit,
        })

        return { total, page, limit, data }
    }

    async findMany(options: {
        condition: BaseCondition<_ENTITY>
        limit?: number
        sort?: _SORT
        relation?: _RELATION
        relationLoadStrategy?: 'query' | 'join'
    }): Promise<_ENTITY[]> {
        const where = this.getWhereOptions(options.condition)
        const order = options.sort as FindOptionsOrder<_ENTITY>
        const relations = options.relation as FindOptionsRelations<_ENTITY>

        return await this.repository.find({
            relations,
            relationLoadStrategy: options.relationLoadStrategy || 'query',
            where,
            take: options.limit,
            order,
        })
    }

    async findManyBy(condition: BaseCondition<_ENTITY>): Promise<_ENTITY[]> {
        const where = this.getWhereOptions(condition)
        return await this.repository.findBy(where)
    }

    async findManyByIds(ids: number[]): Promise<_ENTITY[]> {
        return await this.findManyBy({ id: { IN: ids } } as any)
    }

    async findOne(options: {
        condition: BaseCondition<_ENTITY>
        sort?: _SORT
        relation?: _RELATION
        relationLoadStrategy?: 'query' | 'join'
    }): Promise<_ENTITY> {
        const where = this.getWhereOptions(options.condition)
        const order = options.sort as FindOptionsOrder<_ENTITY>
        const relations = options.relation as FindOptionsRelations<_ENTITY>

        return await this.repository.findOne({
            relations,
            relationLoadStrategy: options.relationLoadStrategy || 'join',
            where,
            order,
        })
    }

    async findOneBy(condition: BaseCondition<_ENTITY>): Promise<_ENTITY> {
        const where = this.getWhereOptions(condition)
        return await this.repository.findOneBy(where)
    }

    async findOneById(id: number): Promise<_ENTITY> {
        return await this.findOneBy({ id } as any)
    }

    async insertMany<X extends Partial<Omit<_ENTITY, 'id'>>>(
        data: NoExtra<Partial<Omit<_ENTITY, 'id'>>, X>[]
    ): Promise<number[]> {
        const insertResult = await this.repository.insert(data)
        return insertResult.identifiers.map((i) => i.id)
    }

    async insertManyFullField<X extends Omit<_ENTITY, 'id'>>(
        data: NoExtra<Omit<_ENTITY, 'id'>, X>[]
    ): Promise<number[]> {
        const insertResult = await this.repository.insert(data)
        return insertResult.identifiers.map((i) => i.id)
    }

    async insertOne<X extends Partial<Omit<_ENTITY, 'id'>>>(
        data: NoExtra<Partial<Omit<_ENTITY, 'id'>>, X>
    ): Promise<number> {
        const insertResult = await this.repository.insert(data)
        return insertResult.identifiers[0].id
    }

    async insertOneFullField<X extends Omit<_ENTITY, 'id'>>(data: NoExtra<Omit<_ENTITY, 'id'>, X>): Promise<number> {
        const insertResult = await this.repository.insert(data)
        return insertResult.identifiers[0].id
    }

    async update<X extends Partial<Omit<_ENTITY, 'id' | 'oid'>>>(
        condition: ConditionAnd<_ENTITY>,
        data: NoExtra<Partial<Omit<_ENTITY, 'id' | 'oid'>>, X>
    ): Promise<number> {
        const where = this.getConditionsAnd(condition)
        const updateResult = await this.repository.update(where, data)
        return updateResult.affected
    }
}
