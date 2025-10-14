import {
  DataSource,
  EntityManager,
  EntityTarget,
  FindOptionsOrder,
  FindOptionsRelations,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm'
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel'
import { BaseCondition, BaseOperator } from '../../common/dto'
import { NoExtra } from '../../common/helpers/typescript.helper'
import { GenerateId } from '../common/generate-id'
import { PostgreSqlRaw } from '../common/postgresql.raw'

type EntityType<_ENTITY> = EntityTarget<_ENTITY> & {
  fromRaw: (raw: { [P in keyof _ENTITY]: any }) => _ENTITY
  fromRaws: (raws: { [P in keyof _ENTITY]: any }[]) => _ENTITY[]
}

export abstract class _PostgreSqlRepository<
  _ENTITY,
  _RELATION = { [P in keyof _ENTITY]?: boolean },
  _INSERT = Omit<_ENTITY, 'createdAt' | 'updatedAt' | 'deletedAt'>,
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

  getManager() {
    return this.repository.manager
  }

  async getMaxId() {
    const queryResult = await this.repository.query(
      `SELECT last_value FROM "${this.entity['name']}_id_seq"`
    )
    return Number(queryResult[0].last_value)
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
    data.forEach((i) => {
      if (!i['id']) i['id'] = GenerateId.nextId()
    })
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
    data.forEach((i) => {
      if (!i['id']) i['id'] = GenerateId.nextId()
    })
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
    if (!data.length) return []
    const raws = await this.insertManyAndReturnRaws(data)
    return this.entity.fromRaws(raws)
  }

  async insertOne<X extends Partial<_INSERT>>(data: NoExtra<Partial<_INSERT>, X>): Promise<number> {
    if (!data['id']) {
      data['id'] = GenerateId.nextId()
    }
    const insertResult = await this.repository.insert(data)
    const id = insertResult.identifiers[0].id
    if (!id) {
      console.log(`Insert ${this.entity['name']} failed, insertResult: `, insertResult)
      console.log(`Insert ${this.entity['name']} failed, data: `, data)
      throw new Error(
        `Insert ${this.entity['name']} failed: insertResult.identifiers[0] = ${insertResult.identifiers[0]}`
      )
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
    if (!data['id']) {
      data['id'] = GenerateId.nextId()
    }
    const insertResult: InsertResult = await this.repository
      .createQueryBuilder()
      .insert()
      .values(data)
      .returning('*')
      .execute()
    if (insertResult.raw?.length !== 1) {
      console.log(`Insert ${this.entity['name']} failed, insertResult.raw: `, insertResult.raw)
      console.log(`Insert ${this.entity['name']} failed, data: `, data)
      throw new Error(
        `Insert ${this.entity['name']} failed: raws.length = ${insertResult.raw.length}`
      )
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

  async updateBasic<X extends Partial<_UPDATE>>(
    condition: BaseCondition<_ENTITY>,
    data: NoExtra<Partial<_UPDATE>, X>
  ): Promise<number> {
    const where = this.getWhereOptions(condition)
    const updateResult = await this.repository.update(where, data)
    return updateResult.affected
  }

  async update<X extends Partial<_UPDATE>>(
    condition: BaseCondition<_ENTITY>,
    data: NoExtra<Partial<_UPDATE>, X>
  ): Promise<_ENTITY[]> {
    const where = this.getWhereOptions(condition)
    const updateResult: UpdateResult = await this.repository
      .createQueryBuilder()
      .update()
      .where(where)
      .set(data)
      .returning('*')
      .execute()
    const raws = updateResult.raw
    return this.entity.fromRaws(raws)
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
      console.log(`Update ${this.entity['name']} failed, raws: `, raws)
      throw new Error(`Update ${this.entity['name']} failed: raws.length = ${raws.length}`)
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
      console.log(`Insert ${this.entity['name']} failed, upsertResult: `, upsertResult)
      console.log(`Insert ${this.entity['name']} failed, upsertList: `, upsertList)
      throw new Error(
        `Insert ${this.entity['name']} failed: `
        + `upsertResult.raw?.length = ${upsertResult.raw?.length}`
        + `upsertList.length = ${upsertList.length}`
      )
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

  async deleteOneAndReturnEntity(condition: BaseCondition<_ENTITY>): Promise<_ENTITY> {
    const raws = await this.deleteAndReturnRaw(condition)
    if (raws.length !== 1) {
      console.log(`Delete ${this.entity['name']} failed, raws: `, raws)
      throw new Error(`Delete ${this.entity['name']} failed: raws.length = ${raws.length}`)
    }
    return this.entity.fromRaw(raws[0])
  }

  async countGroup(options: {
    condition: BaseCondition<_ENTITY>
    groupBy?: (keyof _ENTITY)[]
  }): Promise<number> {
    const { condition, groupBy } = options
    const where = this.getWhereOptions(condition)

    const groupString = groupBy.map((field) => `"${field as string}"`).join(', ')
    const query = this.getManager()
      .createQueryBuilder()
      .select('COUNT(*)', 'total')
      .from((qb) => {
        return qb
          .subQuery()
          .select(groupString)
          .from(this.entity, 'h')
          .where(where)
          .groupBy(groupString)
      }, 'temp')

    const totalResponse = await query.getRawOne()

    return Number(totalResponse.total)
  }

  async findAndSelect<
    Aggregate extends Record<
      string,
      {
        SUM?: (number | keyof _ENTITY | BaseOperator<keyof _ENTITY>)[]
        COUNT?: keyof _ENTITY | '*'
      }
    >,
    SELECT extends (keyof _ENTITY)[] | { [P in keyof _ENTITY]?: boolean },
  >(options: {
    condition: BaseCondition<_ENTITY>
    select?: SELECT
    aggregate?: Aggregate
    groupBy?: (keyof _ENTITY)[]
    orderBy?: { [P in keyof _ENTITY]?: 'ASC' | 'DESC' } | { [P in keyof Aggregate]: 'ASC' | 'DESC' }
    page?: number
    limit?: number
  }): Promise<{
    dataRaws: ((SELECT extends (keyof _ENTITY)[]
      ? { [P in SELECT[number]]: _ENTITY[P] }
      : SELECT extends { [P in keyof _ENTITY]?: boolean }
      ? { [P in keyof SELECT as SELECT[P] extends true ? P : never]: _ENTITY }
      : never) & { [P in keyof Aggregate]: string })[]
  }> {
    const { condition, select, aggregate, groupBy, orderBy, page, limit } = options
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
            if (typeof operator === 'number') {
              const column = operator as number
              return `${column}`
            }
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

    let query = this.repository.createQueryBuilder().select(selectList).where(where)
    if (groupBy && groupBy.length) {
      const groupString = groupBy.map((field) => `"${field as string}"`).join(', ')
      query = query.groupBy(groupString)
    }
    if (orderBy) {
      Object.keys(orderBy).forEach((column, index) => {
        if (index == 0) {
          query = query.orderBy(`"${column}"`, orderBy[column])
        } else {
          query = query.addOrderBy(`"${column}"`, orderBy[column])
        }
      })
    }

    if (limit) {
      query = query.take(limit)
      if (page) {
        query = query.skip((page - 1) * limit)
      }
    }

    const dataRaws = await query.getRawMany()

    return { dataRaws }
  }

  async managerFindMany<S extends _SORT, R extends _RELATION>(
    manager: EntityManager,
    options: {
      condition: BaseCondition<_ENTITY>
      limit?: number
      sort?: NoExtra<_SORT, S>
      relation?: NoExtra<_RELATION, R>
      relationLoadStrategy?: 'query' | 'join'
    }
  ): Promise<_ENTITY[]> {
    const where = this.getWhereOptions(options.condition)
    const order = options.sort as FindOptionsOrder<_ENTITY>
    const relations = options.relation as FindOptionsRelations<_ENTITY>

    return await manager.find(this.entity, {
      relations,
      relationLoadStrategy: options.relationLoadStrategy || 'query',
      where,
      take: options.limit,
      order,
    })
  }

  async managerFindManyBy(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>
  ): Promise<_ENTITY[]> {
    const where = this.getWhereOptions(condition)
    return await manager.findBy(this.entity, where)
  }

  async managerFindOne<S extends _SORT, R extends _RELATION>(
    manager: EntityManager,
    options: {
      condition: BaseCondition<_ENTITY>
      sort?: NoExtra<_SORT, S>
      relation?: NoExtra<_RELATION, R>
      relationLoadStrategy?: 'query' | 'join'
    }
  ): Promise<_ENTITY | null> {
    const where = this.getWhereOptions(options.condition)
    const order = options.sort as FindOptionsOrder<_ENTITY>
    const relations = options.relation as FindOptionsRelations<_ENTITY>

    return await manager.findOne(this.entity, {
      relations,
      relationLoadStrategy: options.relationLoadStrategy || 'join',
      where,
      order,
    })
  }

  async managerFindOneBy(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>
  ): Promise<_ENTITY | null> {
    const where = this.getWhereOptions(condition)
    return await manager.findOneBy(this.entity, where)
  }

  async managerInsertManyBasic<X extends Partial<_INSERT>>(
    manager: EntityManager,
    data: NoExtra<Partial<_INSERT>, X>[]
  ): Promise<number[]> {
    if (!data.length) return []
    data.forEach((i) => {
      if (!i['id']) i['id'] = GenerateId.nextId()
    })
    const insertResult = await manager.insert(this.entity, data)
    const idList = insertResult.identifiers.map((i) => i.id)
    return idList
  }

  async managerInsertOneBasic<X extends Partial<_INSERT>>(
    manager: EntityManager,
    data: NoExtra<Partial<_INSERT>, X>
  ): Promise<number> {
    if (!data['id']) {
      data['id'] = GenerateId.nextId()
    }
    const insertResult = await manager.insert(this.entity, data)
    const id = insertResult.identifiers[0].id
    if (!id) {
      console.log(`Insert ${this.entity['name']} failed, insertResult: `, insertResult)
      console.log(`Insert ${this.entity['name']} failed, data: `, data)
      throw new Error(
        `Insert ${this.entity['name']} failed: insertResult.identifiers[0] = ${insertResult.identifiers[0]}`
      )
    }
    return id
  }

  async managerUpdateBasic<X extends Partial<_UPDATE>>(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>,
    data: NoExtra<Partial<_UPDATE>, X>
  ): Promise<number> {
    const where = this.getWhereOptions(condition)
    const updateResult = await manager.update(this.entity, where, data)
    return updateResult.affected
  }

  async managerDeleteBasic(manager: EntityManager, condition: BaseCondition<_ENTITY>) {
    const where = this.getWhereOptions(condition)
    const deleteResult = await manager.delete(this.entity, where)
    const affected = deleteResult.affected
    return affected
  }

  async managerInsertMany<X extends Partial<_INSERT>>(
    manager: EntityManager,
    data: NoExtra<Partial<_INSERT>, X>[]
  ): Promise<_ENTITY[]> {
    if (!data.length) return []
    data.forEach((i) => {
      if (!i['id']) i['id'] = GenerateId.nextId()
    })
    const insertResult: InsertResult = await manager
      .createQueryBuilder()
      .insert()
      .into(this.entity)
      .values(data)
      .returning('*')
      .execute()
    const raws = insertResult.raw
    return this.entity.fromRaws(raws)
  }

  async managerInsertOne<X extends Partial<_INSERT>>(
    manager: EntityManager,
    data: NoExtra<Partial<_INSERT>, X>
  ): Promise<_ENTITY> {
    if (!data['id']) {
      data['id'] = GenerateId.nextId()
    }
    const insertResult: InsertResult = await manager
      .createQueryBuilder()
      .insert()
      .into(this.entity)
      .values(data)
      .returning('*')
      .execute()
    if (insertResult.raw?.length !== 1) {
      console.log(`Insert ${this.entity['name']} failed, insertResult.raw: `, insertResult.raw)
      console.log(`Insert ${this.entity['name']} failed, data: `, data)
      throw new Error(
        `Insert ${this.entity['name']} failed: raws.length = ${insertResult.raw.length}`
      )
    }
    return this.entity.fromRaw(insertResult.raw[0])
  }

  async managerDelete(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>
  ): Promise<_ENTITY[]> {
    const where = this.getWhereOptions(condition)
    const deleteResult = await manager
      .createQueryBuilder()
      .delete()
      .from(this.entity)
      .where(where)
      .returning('*')
      .execute()
    const raws = deleteResult.raw
    return this.entity.fromRaws(raws)
  }

  async managerDeleteOne(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>
  ): Promise<_ENTITY> {
    const raws = await this.managerDelete(manager, condition)
    if (raws.length !== 1) {
      console.log(`Delete ${this.entity['name']} failed, raws: `, raws)
      throw new Error(`Delete ${this.entity['name']} failed: raws.length = ${raws.length}`)
    }
    return this.entity.fromRaw(raws[0])
  }

  async managerUpdate<X extends Partial<_UPDATE>>(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>,
    data: NoExtra<Partial<_UPDATE>, X>
  ): Promise<_ENTITY[]> {
    const where = this.getWhereOptions(condition)
    const updateResult: UpdateResult = await manager
      .createQueryBuilder()
      .update(this.entity)
      .where(where)
      .set(data)
      .returning('*')
      .execute()
    const raws = updateResult.raw
    return this.entity.fromRaws(raws)
  }

  async managerUpdateOne<X extends Partial<_UPDATE>>(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>,
    data: NoExtra<Partial<_UPDATE>, X>
  ): Promise<_ENTITY> {
    const entityList = await this.managerUpdate(manager, condition, data)
    if (entityList.length !== 1) {
      console.log(`Update ${this.entity['name']} failed, raws: `, entityList)
      throw new Error(`Update ${this.entity['name']} failed: raws.length = ${entityList.length}`)
    }
    return entityList[0]
  }

  async managerBulkUpdate<T extends Partial<_ENTITY> | Record<string, any>>(options: {
    manager?: EntityManager
    tempList: T[]
    condition?: BaseCondition<_ENTITY>
    compare:
    | Extract<keyof T, keyof _ENTITY>[]
    | {
      [P in Extract<keyof T, keyof _ENTITY>]?:
      | boolean
      | { cast: 'int' | 'bigint' | 'numeric' | 'text' }
      | ((t?: string, u?: string) => string)
    }
    update:
    | Extract<keyof T, keyof _ENTITY>[]
    | {
      [P in keyof _ENTITY]?:
      | boolean
      | { cast: 'int' | 'bigint' | 'numeric' | 'text' }
      | ((t?: string, u?: string) => string)
    }
    options?: { requireEqualLength?: boolean }
  }) {
    const manager = options.manager || this.repository.manager
    const tableName = this.entity['name']

    const tempList = options.tempList || []
    if (!tempList.length) return []

    let compareName: string[] = []
    let compareObject: {
      [P in Extract<keyof T, keyof _ENTITY>]?:
      | boolean
      | { cast: 'int' | 'bigint' | 'numeric' | 'text' }
      | ((t?: string, u?: string) => string)
    } = {}
    let conditionRaw = ''
    if (options.condition) {
      conditionRaw = this.getRawConditions(tableName, options.condition)
    }

    if (Array.isArray(options.compare)) {
      compareName = [...options.compare] as string[]
      options.compare.forEach((field) => {
        compareObject[field] = true
      })
    } else {
      compareName = Object.keys(options.compare).filter((k) => !!options.compare[k])
      compareObject = { ...options.compare }
    }

    let updateName: string[] = []
    let updateObject: {
      [P in Extract<keyof T, keyof _ENTITY>]?:
      | boolean
      | { cast: 'int' | 'bigint' | 'numeric' | 'text' }
      | ((t?: string, u?: string) => string)
    } = {}

    if (Array.isArray(options.update)) {
      updateName = [...options.update] as string[]
      options.update.forEach((field) => {
        updateObject[field] = true
      })
    } else {
      updateName = Object.keys(options.update).filter((k) => !!options.update[k])
      updateObject = { ...options.update }
    }

    if (!updateName.length) return []
    const tempColumns = Object.keys(tempList[0])

    const modifiedRaw: [any[], number] = await manager.query(
      `
      UPDATE  "${tableName}"
      SET     ${updateName.map((field) => {
        if (typeof updateObject[field] === 'function') {
          return `"${field}" = ${updateObject[field]('temp', tableName)}`
        } else if (typeof updateObject[field] === 'object') {
          return `"${field}" = "temp"."${field}"::${updateObject[field].cast}`
        } else {
          return `"${field}" = "temp"."${field}"`
        }
      }).join(`,
              `)}
      FROM (VALUES `
      + tempList
        .map((record) => {
          return `(${tempColumns
            .map((field) => {
              if (record[field] === null) {
                return `NULL`
              } else if (typeof record[field] === 'number') {
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
      + `) 
          AS temp(${tempColumns.map((field) => `"${field}"`).join(', ')})
      WHERE   ${conditionRaw
        ? conditionRaw
        + ` 
          AND `
        : ''
      }${compareName.map((field) => {
        if (typeof compareObject[field] === 'function') {
          return `"${tableName}"."${field}" = ${compareObject[field]('temp', tableName)}`
        } else if (typeof compareObject[field] === 'object') {
          return `"${tableName}"."${field}" = "temp"."${field}"::${compareObject[field].cast}`
        } else {
          return `"${tableName}"."${field}" = "temp"."${field}"`
        }
      }).join(` 
          AND `)}
      RETURNING "${tableName}".*;
      `
    )

    if (options.options?.requireEqualLength) {
      if (modifiedRaw[0].length !== tempList.length) {
        console.log(`Update ${tableName} failed, modifiedRaw: `, modifiedRaw)
        console.log(`Update ${tableName} failed, tempList: `, tempList)
        throw new Error(
          `Update ${tableName} failed: `
          + `modifiedRaw[0].length = ${modifiedRaw[0].length}, `
          + `tempList.length = ${tempList.length}`
        )
      }
    }
    return this.entity.fromRaws(modifiedRaw[0])
  }
}
