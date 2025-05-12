import {
  EntityTarget,
  FindOptionsOrder,
  FindOptionsRelations,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm'
import { BaseCondition, BaseOperator } from '../../common/dto'
import { NoExtra } from '../../common/helpers/typescript.helper'
import { PostgreSqlRaw } from '../common/postgresql.raw'

type EntityType<_ENTITY> = EntityTarget<_ENTITY> & {
  fromRaw: (raw: { [P in keyof _ENTITY]: any }) => _ENTITY
  fromRaws: (raws: { [P in keyof _ENTITY]: any }[]) => _ENTITY[]
}

export abstract class _PostgreSqlRepository<
  _ENTITY,
  _RELATION = { [P in keyof _ENTITY]?: boolean },
  _INSERT = Omit<_ENTITY, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  _UPDATE = Omit<_ENTITY, 'id' | 'createdAt' | 'updatedAt'>,
  _SORT = { [P in keyof _ENTITY]?: 'ASC' | 'DESC' },
> extends PostgreSqlRaw<_ENTITY> {
  private entity: EntityType<_ENTITY>
  private repository: Repository<_ENTITY>

  protected constructor(entity: EntityType<_ENTITY>, repository: Repository<_ENTITY>) {
    super()
    this.entity = entity
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
    const idList = insertResult.identifiers.map((i) => i.id)
    return idList
  }

  async insertManyFullField<X extends _INSERT>(data: NoExtra<_INSERT, X>[]): Promise<number[]> {
    if (!data.length) return []
    return this.insertMany(data)
  }

  async insertManyAndReturnRaws<X extends Partial<_INSERT>>(
    data: NoExtra<Partial<_INSERT>, X>[]
  ): Promise<{ [P in keyof _ENTITY]: any }[]> {
    if (!data.length) return []
    const insertResult: InsertResult = await this.repository
      .createQueryBuilder()
      .insert()
      .values(data)
      .returning('*')
      .execute()
    const raws = insertResult.raw
    return raws
  }

  async insertManyAndReturnEntity<X extends Partial<_INSERT>>(
    data: NoExtra<Partial<_INSERT>, X>[]
  ): Promise<_ENTITY[]> {
    const raws = await this.insertManyAndReturnRaws(data)
    return this.entity.fromRaws(raws)
  }

  async insertManyFullFieldAndReturnRaws<X extends _INSERT>(
    data: NoExtra<_INSERT, X>[]
  ): Promise<{ [P in keyof _ENTITY]: any }[]> {
    if (!data.length) return []
    const raws = this.insertManyAndReturnRaws(data)
    return raws
  }

  async insertManyFullFieldAndReturnEntity<X extends _INSERT>(
    data: NoExtra<_INSERT, X>[]
  ): Promise<_ENTITY[]> {
    const raws = await this.insertManyAndReturnRaws(data)
    return this.entity.fromRaws(raws)
  }

  async insertOne<X extends Partial<_INSERT>>(data: NoExtra<Partial<_INSERT>, X>): Promise<number> {
    const insertResult = await this.repository.insert(data)
    const id = insertResult.identifiers[0].id
    if (!id) {
      throw new Error(`Insert Database failed: ` + JSON.stringify({ insertResult, data }))
    }
    return id
  }

  async insertOneFullField<X extends _INSERT>(data: NoExtra<_INSERT, X>): Promise<number> {
    const id = this.insertOne(data)
    return id
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
    if (insertResult.raw?.length !== 1) {
      throw new Error(`Insert Database failed: ` + JSON.stringify({ insertResult, data }))
    }
    return insertResult.raw[0]
  }

  async insertOneAndReturnEntity<X extends Partial<_INSERT>>(
    data: NoExtra<Partial<_INSERT>, X>
  ): Promise<_ENTITY> {
    const raw = await this.insertOneAndReturnRaw(data)
    return this.entity.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnRaw<X extends _INSERT>(
    data: NoExtra<_INSERT, X>
  ): Promise<{ [P in keyof _ENTITY]: any }> {
    const raw = this.insertOneAndReturnRaw(data)
    return raw
  }

  async insertOneFullFieldAndReturnEntity<X extends _INSERT>(
    data: NoExtra<_INSERT, X>
  ): Promise<_ENTITY> {
    const raw = await this.insertOneAndReturnRaw(data)
    return this.entity.fromRaw(raw)
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
    const raw = updateResult.raw
    return raw
  }

  async updateAndReturnEntity<X extends Partial<_UPDATE>>(
    condition: BaseCondition<_ENTITY>,
    data: NoExtra<Partial<_UPDATE>, X>
  ): Promise<_ENTITY[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return this.entity.fromRaws(raws)
  }

  async updateOneAndReturnEntity<X extends Partial<_UPDATE>>(
    condition: BaseCondition<_ENTITY>,
    data: NoExtra<Partial<_UPDATE>, X>
  ): Promise<_ENTITY> {
    const raws = await this.updateAndReturnRaw(condition, data)
    if (raws.length !== 1) {
      throw new Error(`Update Database failed: ` + JSON.stringify({ raws }))
    }
    return this.entity.fromRaw(raws[0])
  }

  async upsertByConflictUnique(options: {
    upsertList: _INSERT[]
    updateFields: (keyof _ENTITY)[]
    conflictFields: (keyof _ENTITY)[]
  }) {
    const { upsertList, updateFields, conflictFields } = options
    const upsertResult: InsertResult = await this.repository
      .createQueryBuilder()
      .insert()
      .values(upsertList as any)
      .orUpdate(updateFields as string[], conflictFields as string[])
      .returning('*')
      .execute()
    if (upsertResult.raw?.length !== upsertList.length) {
      throw new Error(`Insert Database failed: ` + JSON.stringify({ upsertResult, upsertList }))
    }
    return this.entity.fromRaws(upsertResult.raw)
  }

  async delete(condition: BaseCondition<_ENTITY>) {
    const where = this.getWhereOptions(condition)
    const deleteResult = await this.repository.delete(where)
    return deleteResult.affected
  }

  async deleteAndReturnRaw(
    condition: BaseCondition<_ENTITY>
  ): Promise<{ [P in keyof _ENTITY]: any }[]> {
    const where = this.getWhereOptions(condition)
    const deleteResult = await this.repository
      .createQueryBuilder()
      .delete()
      .from(this.entity)
      .where(where)
      .returning('*')
      .execute()
    const raws = deleteResult.raw
    return raws
  }

  async deleteAndReturnEntity(condition: BaseCondition<_ENTITY>): Promise<_ENTITY[]> {
    const raws = await this.deleteAndReturnRaw(condition)
    return this.entity.fromRaws(raws)
  }

  async findAndSelect<
    Aggregate extends Record<
      string,
      { SUM?: (keyof _ENTITY | BaseOperator<keyof _ENTITY>)[]; COUNT?: keyof _ENTITY | '*' }
    >,
  >(options: {
    condition: BaseCondition<_ENTITY>
    select?: { [P in keyof _ENTITY]?: boolean } | (keyof _ENTITY)[]
    aggregate?: Aggregate
    groupBy?: (keyof _ENTITY)[]
  }): Promise<({ [P in keyof _ENTITY]?: any } & { [P in keyof Aggregate]: any })[]> {
    const { condition, select, aggregate, groupBy } = options
    const where = this.getWhereOptions(condition)
    const selectList: string[] = []
    if (select) {
      if (Array.isArray(select)) {
        select.forEach((column) => {
          selectList.push(`"${column as string}"`)
        })
      } else {
        Object.keys(select).map((column) => {
          if (select[column]) {
            selectList.push(`"${column as string}"`)
          }
        })
      }
    }
    if (aggregate) {
      Object.keys(aggregate).forEach((customField) => {
        if (aggregate[customField].COUNT) {
          const column = aggregate[customField].COUNT as string
          if (column === '*') {
            selectList.push(`COUNT(${column}) AS "${customField}"`)
          } else {
            selectList.push(`COUNT("${column}") AS "${customField}"`)
          }
        } else if (aggregate[customField].SUM) {
          const sumString = aggregate[customField].SUM.map((operator) => {
            if (typeof operator === 'string') {
              const column = operator as string
              return `"${column}"`
            }
            if (typeof operator === 'object') {
              return this.getOperatorRaw(operator)
            }
          }).join('+')
          selectList.push(`SUM(${sumString}) AS "${customField}"`)
        }
      })
    }

    let query = this.repository.createQueryBuilder().select(selectList).where(where).groupBy()
    if (groupBy && groupBy.length) {
      const groupString = groupBy.map((field) => `"${field as string}"`).join(', ')
      query = query.groupBy(groupString)
    }

    return await query.getRawMany()
  }

  async updateListAndReturnEntity(options: {
    updateList: Partial<_ENTITY>[]
    conditionFields: (keyof _ENTITY)[]
    updateFields: (keyof _ENTITY)[]
  }) {
    const { updateList } = options
    const updateFields = options.updateFields as string[]
    const conditionFields = options.conditionFields as string[]

    if (!updateList.length) return []
    if (!conditionFields.length) return []
    if (!conditionFields.length) return []

    const tempField = [...conditionFields, ...updateFields]
    const tableName = this.entity['name']

    const modifiedRaw: [any[], number] = await this.repository.query(
      `
        UPDATE  "${tableName}"
        SET     ${updateFields.map((field) => `"${field}" = temp."${field}"`).join(', ')}
        FROM (VALUES `
      + updateList
        .map((record) => {
          return `(${tempField
            .map((field) => {
              if (typeof record[field] === 'number') {
                return `${record[field]}`
              } else if (typeof record[field] === 'string') {
                return `'${record[field]}'`
              } else {
                return `${record[field]}`
              }
            })
            .join(', ')})`
        })
        .join(', ')
      + `   ) AS temp(${tempField.map((field) => `"${field}"`).join(', ')})
        WHERE     ${conditionFields.map((field) => `"${tableName}"."${field}" = "temp"."${field}"`).join(' AND ')}
        RETURNING "${tableName}".*;
        `
    )
    if (modifiedRaw[0].length !== updateList.length) {
      console.log('🚀 ~ _postgresql.repository.ts:353 ~ updateList:', updateList)
      console.log('🚀 ~ _postgresql.repository.ts:353 ~ modifiedRaw:', modifiedRaw)
      throw new Error(`Update Database failed: ` + JSON.stringify({ modifiedRaw, updateList }))
    }
    return this.entity.fromRaws(modifiedRaw[0])
  }
}
