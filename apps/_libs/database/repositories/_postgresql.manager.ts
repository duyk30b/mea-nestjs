import {
  EntityManager,
  EntityTarget,
  FindOptionsOrder,
  FindOptionsRelations,
  InsertResult,
  UpdateResult,
} from 'typeorm'
import { BaseCondition } from '../../common/dto'
import { NoExtra } from '../../common/helpers/typescript.helper'
import { PostgreSqlRaw } from '../common/postgresql.raw'

type EntityType<_ENTITY> = EntityTarget<_ENTITY> & {
  fromRaw: (raw: { [P in keyof _ENTITY]: any }) => _ENTITY
  fromRaws: (raws: { [P in keyof _ENTITY]: any }[]) => _ENTITY[]
}

export abstract class _PostgreSqlManager<
  _ENTITY,
  _RELATION = { [P in keyof _ENTITY]?: boolean },
  _INSERT = Omit<_ENTITY, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  _UPDATE = Omit<_ENTITY, 'id' | 'createdAt' | 'updatedAt'>,
  _SORT = { [P in keyof _ENTITY]?: 'ASC' | 'DESC' },
> extends PostgreSqlRaw<_ENTITY> {
  private entity: EntityType<_ENTITY>

  protected constructor(entity: EntityType<_ENTITY>) {
    super()
    this.entity = entity
  }

  async findMany<S extends _SORT, R extends _RELATION>(
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

  async findManyBy(manager: EntityManager, condition: BaseCondition<_ENTITY>): Promise<_ENTITY[]> {
    const where = this.getWhereOptions(condition)
    return await manager.findBy(this.entity, where)
  }

  async findOne<S extends _SORT, R extends _RELATION>(
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

  async findOneBy(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>
  ): Promise<_ENTITY | null> {
    const where = this.getWhereOptions(condition)
    return await manager.findOneBy(this.entity, where)
  }

  async insertMany<X extends Partial<_INSERT>>(
    manager: EntityManager,
    data: NoExtra<Partial<_INSERT>, X>[]
  ): Promise<number[]> {
    if (!data.length) return []
    const insertResult = await manager.insert(this.entity, data)
    const idList = insertResult.identifiers.map((i) => i.id)
    return idList
  }

  async insertManyFullField<X extends _INSERT>(
    manager: EntityManager,
    data: NoExtra<_INSERT, X>[]
  ): Promise<number[]> {
    if (!data.length) return []
    return this.insertMany(manager, data)
  }

  async insertManyAndReturnRaws<X extends Partial<_INSERT>>(
    manager: EntityManager,
    data: NoExtra<Partial<_INSERT>, X>[]
  ): Promise<{ [P in keyof _ENTITY]: any }[]> {
    if (!data.length) return []
    const insertResult: InsertResult = await manager
      .createQueryBuilder()
      .insert()
      .into(this.entity)
      .values(data)
      .returning('*')
      .execute()
    const raws = insertResult.raw
    return raws
  }

  async insertManyAndReturnEntity<X extends Partial<_INSERT>>(
    manager: EntityManager,
    data: NoExtra<Partial<_INSERT>, X>[]
  ): Promise<_ENTITY[]> {
    const raws = await this.insertManyAndReturnRaws(manager, data)
    return this.entity.fromRaws(raws)
  }

  async insertManyFullFieldAndReturnRaws<X extends _INSERT>(
    manager: EntityManager,
    data: NoExtra<_INSERT, X>[]
  ): Promise<{ [P in keyof _ENTITY]: any }[]> {
    const raws = await this.insertManyAndReturnRaws(manager, data)
    return raws
  }

  async insertManyFullFieldAndReturnEntity<X extends _INSERT>(
    manager: EntityManager,
    data: NoExtra<_INSERT, X>[]
  ): Promise<_ENTITY[]> {
    const raws = await this.insertManyAndReturnRaws(manager, data)
    return this.entity.fromRaws(raws)
  }

  async insertOne<X extends Partial<_INSERT>>(
    manager: EntityManager,
    data: NoExtra<Partial<_INSERT>, X>
  ): Promise<number> {
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

  async insertOneFullField<X extends _INSERT>(
    manager: EntityManager,
    data: NoExtra<_INSERT, X>
  ): Promise<number> {
    const id = this.insertOne(manager, data)
    return id
  }

  async insertOneAndReturnRaw<X extends Partial<_INSERT>>(
    manager: EntityManager,
    data: NoExtra<Partial<_INSERT>, X>
  ): Promise<{ [P in keyof _ENTITY]: any }> {
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
    return insertResult.raw[0]
  }

  async insertOneAndReturnEntity<X extends Partial<_INSERT>>(
    manager: EntityManager,
    data: NoExtra<Partial<_INSERT>, X>
  ): Promise<_ENTITY> {
    const raw = await this.insertOneAndReturnRaw(manager, data)
    return this.entity.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnRaw<X extends _INSERT>(
    manager: EntityManager,
    data: NoExtra<_INSERT, X>
  ): Promise<{ [P in keyof _ENTITY]: any }> {
    const raw = await this.insertOneAndReturnRaw(manager, data)
    return raw
  }

  async insertOneFullFieldAndReturnEntity<X extends _INSERT>(
    manager: EntityManager,
    data: NoExtra<_INSERT, X>
  ): Promise<_ENTITY> {
    const raw = await this.insertOneAndReturnRaw(manager, data)
    return this.entity.fromRaw(raw)
  }

  async update<X extends Partial<_UPDATE>>(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>,
    data: NoExtra<Partial<_UPDATE>, X>
  ): Promise<number> {
    const where = this.getWhereOptions(condition)
    const updateResult = await manager.update(this.entity, where, data)
    return updateResult.affected
  }

  async updateAndReturnRaw<X extends Partial<_UPDATE>>(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>,
    data: NoExtra<Partial<_UPDATE>, X>
  ): Promise<{ [P in keyof _ENTITY]: any }[]> {
    const where = this.getWhereOptions(condition)
    const updateResult: UpdateResult = await manager
      .createQueryBuilder()
      .update(this.entity)
      .where(where)
      .set(data)
      .returning('*')
      .execute()
    const raws = updateResult.raw
    return raws
  }

  async updateAndReturnEntity<X extends Partial<_UPDATE>>(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>,
    data: NoExtra<Partial<_UPDATE>, X>
  ): Promise<_ENTITY[]> {
    const raws = await this.updateAndReturnRaw(manager, condition, data)
    return this.entity.fromRaws(raws)
  }

  async updateOneAndReturnEntity<X extends Partial<_UPDATE>>(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>,
    data: NoExtra<Partial<_UPDATE>, X>
  ): Promise<_ENTITY> {
    const raws = await this.updateAndReturnRaw(manager, condition, data)
    if (raws.length !== 1) {
      console.log(`Update ${this.entity['name']} failed, raws: `, raws)
      throw new Error(`Update ${this.entity['name']} failed: raws.length = ${raws.length}`)
    }
    return this.entity.fromRaw(raws[0])
  }

  async upsertByConflictUnique(options: {
    manager: EntityManager
    upsertList: _INSERT[]
    updateFields: (keyof _ENTITY)[]
    conflictFields: (keyof _ENTITY)[]
  }) {
    const { manager, upsertList, updateFields, conflictFields } = options
    const upsertResult: InsertResult = await manager
      .createQueryBuilder()
      .insert()
      .values(upsertList as any)
      .orUpdate(updateFields as string[], conflictFields as string[])
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

  async delete(manager: EntityManager, condition: BaseCondition<_ENTITY>) {
    const where = this.getWhereOptions(condition)
    const deleteResult = await manager.delete(this.entity, where)
    const affected = deleteResult.affected
    return affected
  }

  async deleteAndReturnRaw(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>
  ): Promise<{ [P in keyof _ENTITY]: any }[]> {
    const where = this.getWhereOptions(condition)
    const deleteResult = await manager
      .createQueryBuilder()
      .delete()
      .from(this.entity)
      .where(where)
      .returning('*')
      .execute()
    const raws = deleteResult.raw
    return raws
  }

  async deleteAndReturnEntity(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>
  ): Promise<_ENTITY[]> {
    const raws = await this.deleteAndReturnRaw(manager, condition)
    return this.entity.fromRaws(raws)
  }

  async deleteOneAndReturnEntity(
    manager: EntityManager,
    condition: BaseCondition<_ENTITY>
  ): Promise<_ENTITY> {
    const raws = await this.deleteAndReturnRaw(manager, condition)
    if (raws.length !== 1) {
      console.log(`Delete ${this.entity['name']} failed, raws: `, raws)
      throw new Error(`Delete ${this.entity['name']} failed: raws.length = ${raws.length}`)
    }
    return this.entity.fromRaw(raws[0])
  }

  async bulkUpdate<T extends Partial<_ENTITY> | Record<string, any>>(options: {
    manager: EntityManager
    tempList: T[]
    condition?: BaseCondition<_ENTITY>
    compare:
    | Extract<keyof T, keyof _ENTITY>[]
    | { [P in Extract<keyof T, keyof _ENTITY>]?: boolean | ((t?: string, u?: string) => string) }
    update:
    | Extract<keyof T, keyof _ENTITY>[]
    | {
      [P in keyof _ENTITY]?:
      | ((t?: string, u?: string) => string)
      | boolean
      | { cast: 'int' | 'bigint' | 'numeric' | 'text' }
    }
    options?: { requireEqualLength?: boolean }
  }) {
    const { manager } = options
    const tableName = this.entity['name']

    const tempList = options.tempList || []
    if (!tempList.length) return []

    let compareName: string[] = []
    let compareObject: {
      [P in Extract<keyof T, keyof _ENTITY>]?: boolean | ((t?: string, u?: string) => string)
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
      compareName = Object.keys(options.compare)
      compareObject = { ...options.compare }
    }

    let updateName: string[] = []
    let updateObject: {
      [P in Extract<keyof T, keyof _ENTITY>]?:
      | ((t?: string, u?: string) => string)
      | boolean
      | { cast: 'int' | 'bigint' | 'numeric' | 'text' }
    } = {}

    if (Array.isArray(options.update)) {
      updateName = [...options.update] as string[]
      options.update.forEach((field) => {
        updateObject[field] = true
      })
    } else {
      updateName = Object.keys(options.update)
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
        if (typeof compareObject[field] !== 'function') {
          return `"${tableName}"."${field}" = "temp"."${field}"`
        } else {
          return `"${tableName}"."${field}" = ${compareObject[field]('temp', tableName)}`
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
          + `modifiedRaw[0].length = ${modifiedRaw[0].length}`
          + `tempList.length = ${tempList.length}`
        )
      }
    }
    return this.entity.fromRaws(modifiedRaw[0])
  }
}
