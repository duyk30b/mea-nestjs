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
} from 'typeorm'
import { ConditionAnd, ConditionType, NoExtra } from '../../common/dto/base-condition'
import { BaseSqlCondition } from './base-sql.condition'

export abstract class BaseSqlRepository<
    _ENTITY,
    _SORT = { [P in keyof _ENTITY]?: 'ASC' | 'DESC' },
    _RELATION = { [P in keyof _ENTITY]?: boolean },
> extends BaseSqlCondition<_ENTITY> {
    private repository: Repository<_ENTITY>

    protected constructor(repository: Repository<_ENTITY>) {
        super()
        this.repository = repository
    }

    async pagination(options: {
        page: number
        limit: number
        condition?: ConditionType<_ENTITY>
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
        condition: ConditionType<_ENTITY>
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

    async findManyBy(condition: ConditionType<_ENTITY>): Promise<_ENTITY[]> {
        const where = this.getWhereOptions(condition)
        return await this.repository.findBy(where)
    }

    async findManyByIds(ids: number[]): Promise<_ENTITY[]> {
        return await this.findManyBy({ id: { IN: ids } } as any)
    }

    async findOne(options: {
        condition: ConditionType<_ENTITY>
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

    async findOneBy(condition: ConditionType<_ENTITY>): Promise<_ENTITY> {
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

    async delete(condition: ConditionAnd<_ENTITY>) {
        const where = this.getConditionsAnd(condition)
        const updateResult = await this.repository.update(where, { deletedAt: Date.now() } as any)
        return updateResult.affected
    }
}
