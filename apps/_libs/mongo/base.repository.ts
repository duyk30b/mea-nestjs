import { FilterQuery, Model, UpdateQuery } from 'mongoose'
import { NoExtra } from '../common/helpers'

export abstract class BaseMongoRepository<
  _SCHEMA,
  _TYPE,
  _SORT = { [P in keyof _SCHEMA]?: 'ASC' | 'DESC' },
  _RELATION = { [P in keyof _SCHEMA]?: boolean },
> {
  private model: Model<_SCHEMA>

  protected constructor(model: Model<_SCHEMA>) {
    this.model = model
  }

  getFilterOptions(condition: FilterQuery<_SCHEMA> = {}) {
    Object.keys(condition).forEach((key) => {
      if (condition[key] === undefined) delete condition[key]
    })
    return condition
  }

  async pagination(options: {
    skip: number
    limit: number
    hasCount?: boolean
    condition?: FilterQuery<_SCHEMA>
  }) {
    const { limit, skip, hasCount, condition } = options
    const filter = this.getFilterOptions(condition)

    const [docs, count] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).exec(),
      hasCount ? this.model.countDocuments(filter) : 0,
    ])
    const data = docs.map((i) => i.toObject()) as _SCHEMA[]
    return { skip, limit, count, data }
  }

  async findMany(options: {
    condition?: FilterQuery<_SCHEMA>
    order?: { [P in keyof _SCHEMA]?: 'asc' | 'desc' }
    relation?: { [P in keyof _SCHEMA] }
  }): Promise<_TYPE[]> {
    const { condition, order } = options
    const filter = this.getFilterOptions(condition)
    const docs = await this.model.find(filter).sort(order).exec()
    const result = docs.map((i) => i.toObject())
    return result as _TYPE[]
  }

  async findManyBy(condition: FilterQuery<_SCHEMA>): Promise<_TYPE[]> {
    const filter = this.getFilterOptions(condition)

    const docs = await this.model.find(filter).exec()
    const result = docs.map((i) => i.toObject())
    return result as _TYPE[]
  }

  async findManyByIds(ids: string[]): Promise<_TYPE[]> {
    const docs = await this.model.find({ _id: { $in: ids } } as any).exec()
    const result = docs.map((i) => i.toObject())
    return result as _TYPE[]
  }

  async findOneBy(condition: FilterQuery<_SCHEMA>): Promise<_TYPE> {
    const filter = this.getFilterOptions(condition)

    const doc = await this.model.findOne(filter)
    const result = doc ? doc.toObject() : null
    return result as _TYPE
  }

  async findOneById(id: string): Promise<_TYPE> {
    const doc = await this.model.findOne({ _id: id } as any)
    const result = doc ? doc.toObject() : null
    return result as _TYPE
  }

  async insertOne<T extends Partial<_TYPE>>(data: NoExtra<Partial<_TYPE>, T>): Promise<_TYPE> {
    const model = new this.model(data)
    const doc = await model.save()
    const result = doc.toObject()
    return result as _TYPE
  }

  async insertOneFullField<T extends _TYPE>(data: NoExtra<_TYPE, T>): Promise<_TYPE> {
    const model = new this.model(data)
    const hydratedDocument = await model.save()
    const result = hydratedDocument.toObject()
    return result as _TYPE
  }

  async insertMany<T extends Partial<_TYPE>>(data: NoExtra<Partial<_TYPE>, T>[]): Promise<_TYPE[]> {
    const hydratedDocument = await this.model.insertMany(data)
    const result = hydratedDocument.map((i: any) => i.toObject())
    return result
  }

  async insertManyFullField<T extends _TYPE>(data: NoExtra<_TYPE, T>[]): Promise<_TYPE[]> {
    const hydratedDocument = await this.model.insertMany(data)
    const result = hydratedDocument.map((i: any) => i.toObject())
    return result
  }

  async updateOne<T extends Partial<_TYPE>>(
    condition: FilterQuery<_SCHEMA>,
    data: NoExtra<Partial<_TYPE>, T>
  ): Promise<_TYPE> {
    const filter = this.getFilterOptions(condition)
    const hydratedDocument = await this.model.findOneAndUpdate(
      filter,
      data as unknown as UpdateQuery<_SCHEMA>,
      {
        new: true,
      }
    )
    const result = hydratedDocument ? hydratedDocument.toObject() : null
    return result as _TYPE
  }

  async deleteOne(condition: FilterQuery<_SCHEMA>) {
    const filter = this.getFilterOptions(condition)
    const result = await this.model.deleteOne(filter)
    return result.deletedCount
  }

  async deleteMany(condition: FilterQuery<_SCHEMA>) {
    const filter = this.getFilterOptions(condition)
    const result = await this.model.deleteMany(filter)
    return result.deletedCount
  }
}
