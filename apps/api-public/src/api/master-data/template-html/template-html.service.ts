import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { TemplateHtmlRepository } from '../../../../../_libs/database/repositories'
import {
  TemplateHtmlCreateBody,
  TemplateHtmlGetManyQuery,
  TemplateHtmlGetOneQuery,
  TemplateHtmlPaginationQuery,
  TemplateHtmlUpdateBody,
} from './request'

@Injectable()
export class TemplateHtmlService {
  constructor(private readonly templateHtmlRepository: TemplateHtmlRepository) { }

  async pagination(oid: number, query: TemplateHtmlPaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.templateHtmlRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid: { IN: [1, oid] },
        updatedAt: filter?.updatedAt,
      },
      sort: sort || { priority: 'ASC' },
    })
    return { templateHtmlList: data, total, page, limit }
  }

  async getList(oid: number, query: TemplateHtmlGetManyQuery) {
    const { limit, filter, relation, sort } = query

    const templateHtmlList = await this.templateHtmlRepository.findMany({
      relation,
      condition: {
        oid: { IN: [1, oid] },
        updatedAt: filter?.updatedAt,
      },
      limit,
      sort: sort || { priority: 'ASC' },
    })
    return { templateHtmlList }
  }

  async getOne(oid: number, query: TemplateHtmlGetOneQuery) {
    const { filter, relation } = query
    const templateHtml = await this.templateHtmlRepository.findOne({
      relation,
      condition: {
        oid: { IN: [1, oid] },
        updatedAt: filter?.updatedAt,
      },
    })
    return { templateHtml }
  }

  async detail(oid: number, id: number, query: TemplateHtmlGetOneQuery) {
    const templateHtml = await this.templateHtmlRepository.findOne({
      condition: {
        oid: { IN: [1, oid] },
        id,
      },
      relation: query.relation,
    })
    if (!templateHtml) throw new BusinessException('error.Database.NotFound')
    return { templateHtml }
  }

  async createOne(oid: number, body: TemplateHtmlCreateBody) {
    const templateHtml = await this.templateHtmlRepository.insertOne({
      oid,
      ...body,
    })
    if (!templateHtml) throw new BusinessException('error.Database.InsertFailed')
    return { templateHtml }
  }

  async updateOne(oid: number, id: number, body: TemplateHtmlUpdateBody) {
    const templateHtml = await this.templateHtmlRepository.updateOne({ id, oid }, body)
    if (!templateHtml) throw new BusinessException('error.Database.UpdateFailed')
    return { templateHtml }
  }

  async destroyOne(oid: number, id: number) {
    const affected = await this.templateHtmlRepository.deleteBasic({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { templateHtmlId: id }
  }

  async systemList() {
    const templateHtmlSystem = await this.templateHtmlRepository.findMany({
      condition: { oid: 1 },
      sort: { id: 'ASC' },
    })
    return { templateHtmlSystem }
  }
}
