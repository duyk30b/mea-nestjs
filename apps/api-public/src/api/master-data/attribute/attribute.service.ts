import { AttributeRepository } from '@libs/database/repositories/attribute.repository'
import { Injectable } from '@nestjs/common'
import {
    AttributeGetManyQuery,
    AttributePaginationQuery,
    AttributeUpsertBody,
} from './request'

@Injectable()
export class AttributeService {
  constructor(
    private readonly attributeRepository: AttributeRepository
  ) { }

  async pagination(query: AttributePaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.attributeRepository.pagination({
      page,
      limit,
      relation,
      condition: {},
      sort,
    })
    return { attributeList: data, total, page, limit }
  }

  async getMany(query: AttributeGetManyQuery) {
    const { limit, filter, relation } = query

    const data = await this.attributeRepository.findMany({
      relation,
      condition: {},
      limit,
    })
    return { attributeList: data }
  }

  async upsertOne(body: AttributeUpsertBody) {
    const existAttribute = await this.attributeRepository.findOneBy({ key: body.key })
    if (existAttribute) {
      const attribute = await this.attributeRepository.updateOne({ key: existAttribute.key }, body)
      return { attribute }
    } else {
      const attribute = await this.attributeRepository.insertOne(body)
      return { attribute }
    }
  }

  async destroyOne(options: { key: string }) {
    const { key } = options
    await this.attributeRepository.deleteBasic({ key })
    return { key }
  }
}
