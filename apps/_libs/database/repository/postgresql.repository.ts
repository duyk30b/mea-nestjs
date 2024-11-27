import {
  FindOptionsOrder,
  FindOptionsRelations,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm'
import { BaseCondition } from '../../common/dto'
import { NoExtra } from '../../common/helpers/typescript.helper'
import { PostgreSqlCondition } from './postgresql.condition'

export abstract class PostgreSqlRepository<
  _ENTITY,
  _SORT = { [P in keyof _ENTITY]?: 'ASC' | 'DESC' },
  _RELATION = { [P in keyof _ENTITY]?: boolean },
  _INSERT = Omit<_ENTITY, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  _UPDATE = Omit<_ENTITY, 'id' | 'createdAt' | 'updatedAt'>,
> extends PostgreSqlCondition<_ENTITY> {
  private repository: Repository<_ENTITY>

  protected constructor(repository: Repository<_ENTITY>) {
    super()
    this.repository = repository
  }

  async pagination<S extends _SORT, R extends _RELATION>(options: {
    page: number
    limit: number
    condition?: BaseCondition<_ENTITY>
    sort?: NoExtra<_SORT, S>
    relation?: NoExtra<_RELATION, R>
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

  async findMany<S extends _SORT, R extends _RELATION>(options: {
    condition: BaseCondition<_ENTITY>
    limit?: number
    sort?: NoExtra<_SORT, S>
    relation?: NoExtra<_RELATION, R>
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
    if (!ids.length) return []
    return await this.findManyBy({ id: { IN: ids } } as any)
  }

  async findOne<S extends _SORT, R extends _RELATION>(options: {
    condition: BaseCondition<_ENTITY>
    sort?: NoExtra<_SORT, S>
    relation?: NoExtra<_RELATION, R>
    relationLoadStrategy?: 'query' | 'join'
  }): Promise<_ENTITY | null> {
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

  async findOneBy(condition: BaseCondition<_ENTITY>): Promise<_ENTITY | null> {
    const where = this.getWhereOptions(condition)
    return await this.repository.findOneBy(where)
  }

  async findOneById(id: number): Promise<_ENTITY | null> {
    return await this.findOneBy({ id } as any)
  }

  async countBy(condition: BaseCondition<_ENTITY>): Promise<number> {
    const where = this.getWhereOptions(condition)
    const number = await this.repository.countBy(where)
    return number
  }

  async insertMany<X extends Partial<_INSERT>>(
    data: NoExtra<Partial<_INSERT>, X>[]
  ): Promise<number[]> {
    if (!data.length) return []
    const insertResult = await this.repository.insert(data)
    return insertResult.identifiers.map((i) => i.id)
  }

  async insertManyFullField<X extends _INSERT>(data: NoExtra<_INSERT, X>[]): Promise<number[]> {
    if (!data.length) return []
    return this.insertMany(data)
  }

  async insertManyAndReturnRaw<X extends Partial<_INSERT>>(
    data: NoExtra<Partial<_INSERT>, X>[]
  ): Promise<{ [P in keyof _ENTITY]: any }[]> {
    if (!data.length) return []
    const insertResult: InsertResult = await this.repository
      .createQueryBuilder()
      .insert()
      .values(data)
      .returning('*')
      .execute()
    return insertResult.raw
  }

  async insertManyFullFieldAndReturnRaws<X extends _INSERT>(
    data: NoExtra<_INSERT, X>[]
  ): Promise<{ [P in keyof _ENTITY]: any }[]> {
    if (!data.length) return []
    return this.insertManyAndReturnRaw(data)
  }

  async insertOne<X extends Partial<_INSERT>>(data: NoExtra<Partial<_INSERT>, X>): Promise<number> {
    const insertResult = await this.repository.insert(data)
    return insertResult.identifiers[0].id
  }

  async insertOneFullField<X extends _INSERT>(data: NoExtra<_INSERT, X>): Promise<number> {
    return this.insertOne(data)
  }

  async insertOneAndReturnRaw<X extends Partial<_INSERT>>(
    data: NoExtra<Partial<_INSERT>, X>
  ): Promise<{ [P in keyof _ENTITY]: any }> {
    const insertResult: InsertResult = await this.repository
      .createQueryBuilder()
      .insert()
      .values(data)
      .returning('*')
      .execute()
    return insertResult.raw[0]
  }

  async insertOneFullFieldAndReturnRaw<X extends _INSERT>(
    data: NoExtra<_INSERT, X>
  ): Promise<{ [P in keyof _ENTITY]: any }> {
    return this.insertOneAndReturnRaw(data)
  }

  async update<X extends Partial<_UPDATE>>(
    condition: BaseCondition<_ENTITY>,
    data: NoExtra<Partial<_UPDATE>, X>
  ): Promise<number> {
    const where = this.getWhereOptions(condition)
    const updateResult = await this.repository.update(where, data)
    return updateResult.affected
  }

  async updateAndReturnRaw<X extends Partial<_UPDATE>>(
    condition: BaseCondition<_ENTITY>,
    data: NoExtra<Partial<_UPDATE>, X>
  ): Promise<{ [P in keyof _ENTITY]: any }[]> {
    const where = this.getWhereOptions(condition)
    const updateResult: UpdateResult = await this.repository
      .createQueryBuilder()
      .update()
      .where(where)
      .set(data)
      .returning('*')
      .execute()
    return updateResult.raw
  }

  async delete(condition: BaseCondition<_ENTITY>) {
    const where = this.getWhereOptions(condition)
    const deleteResult = await this.repository.delete(where)
    return deleteResult.affected
  }
}
