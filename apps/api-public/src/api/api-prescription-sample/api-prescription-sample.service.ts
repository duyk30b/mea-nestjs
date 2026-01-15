import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers/array.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { PrescriptionSample, PrescriptionSampleItem } from '../../../../_libs/database/entities'
import { PrescriptionSampleItemInsertType } from '../../../../_libs/database/entities/prescription-sample-item.entity'
import { PrescriptionSampleItemRepository } from '../../../../_libs/database/repositories'
import { PrescriptionSampleRepository } from '../../../../_libs/database/repositories/prescription-sample.repository'
import { ProductRepository } from '../../../../_libs/database/repositories/product.repository'
import {
  PrescriptionSampleCreateBody,
  PrescriptionSampleGetManyQuery,
  PrescriptionSamplePaginationQuery,
  PrescriptionSampleRelationQuery,
  PrescriptionSampleUpdateBody,
} from './request'

@Injectable()
export class ApiPrescriptionSampleService {
  constructor(
    private readonly prescriptionSampleRepository: PrescriptionSampleRepository,
    private readonly prescriptionSampleItemRepository: PrescriptionSampleItemRepository,
    private readonly productRepository: ProductRepository
  ) { }

  async pagination(oid: number, query: PrescriptionSamplePaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data: prescriptionSampleList, total } =
      await this.prescriptionSampleRepository.pagination({
        page,
        limit,
        // relation,
        condition: {
          oid,
          userId: filter?.userId,
        },
        sort,
      })

    if (relation) {
      await this.generateRelation({ oid, prescriptionSampleList, relation })
    }

    return { prescriptionSampleList, total, page, limit }
  }

  async getMany(oid: number, query: PrescriptionSampleGetManyQuery) {
    const { limit, filter, relation, sort } = query
    const prescriptionSampleList = await this.prescriptionSampleRepository.findMany({
      condition: {
        oid,
        userId: filter?.userId,
      },
      limit,
      sort,
    })

    if (relation) {
      await this.generateRelation({ oid, prescriptionSampleList, relation })
    }

    return { prescriptionSampleList }
  }

  async getOne(oid: number, id: string) {
    const prescriptionSample = await this.prescriptionSampleRepository.findOneBy({ oid, id })
    if (!prescriptionSample) throw new BusinessException('error.Database.NotFound')
    return { prescriptionSample }
  }

  async createOne(oid: number, body: PrescriptionSampleCreateBody) {
    const { prescriptionSampleBody, prescriptionSampleItemBodyList } = body
    const prescriptionSampleCreated = await this.prescriptionSampleRepository.insertOne({
      ...prescriptionSampleBody,
      oid,
    })

    prescriptionSampleCreated.prescriptionSampleItemList =
      await this.prescriptionSampleItemRepository.insertMany(
        prescriptionSampleItemBodyList.map((i) => {
          const insert: PrescriptionSampleItemInsertType = {
            ...i,
            oid,
            prescriptionSampleId: prescriptionSampleCreated.id,
          }
          return insert
        })
      )
    return { prescriptionSampleCreated }
  }

  async updateOne(oid: number, id: string, body: PrescriptionSampleUpdateBody) {
    const { prescriptionSampleBody, prescriptionSampleItemBodyList } = body

    let prescriptionSampleModified: PrescriptionSample
    let prescriptionSampleItemList: PrescriptionSampleItem[]

    if (prescriptionSampleBody) {
      prescriptionSampleModified = await this.prescriptionSampleRepository.updateOne(
        { oid, id },
        prescriptionSampleBody
      )
    }

    if (prescriptionSampleItemBodyList) {
      await this.prescriptionSampleItemRepository.deleteBasic({ oid, prescriptionSampleId: id })
      prescriptionSampleItemList = await this.prescriptionSampleItemRepository.insertMany(
        prescriptionSampleItemBodyList.map((i) => {
          const insert: PrescriptionSampleItemInsertType = {
            ...i,
            oid,
            prescriptionSampleId: id,
          }
          return insert
        })
      )
    }

    return { prescriptionSampleModified, prescriptionSampleItemList }
  }

  async destroyOne(oid: number, id: string): Promise<BaseResponse> {
    await this.prescriptionSampleRepository.deleteOne({ oid, id })
    return { data: true }
  }

  async generateRelation(options: {
    oid: number
    prescriptionSampleList: PrescriptionSample[]
    relation: PrescriptionSampleRelationQuery
  }) {
    const { oid, prescriptionSampleList, relation } = options
    const prescriptionSampleIdList = ESArray.uniqueArray(prescriptionSampleList.map((i) => i.id))

    const [prescriptionSampleItemList] = await Promise.all([
      relation?.prescriptionSampleItemList && prescriptionSampleIdList.length
        ? this.prescriptionSampleItemRepository.findMany({
          condition: { oid, prescriptionSampleId: { IN: prescriptionSampleIdList } },
          sort: { priority: 'ASC' },
        })
        : <PrescriptionSampleItem[]>[],
    ])

    prescriptionSampleList.forEach((prescriptionSample: PrescriptionSample) => {
      if (relation?.prescriptionSampleItemList) {
        prescriptionSample.prescriptionSampleItemList = prescriptionSampleItemList.filter((i) => {
          return i.prescriptionSampleId === prescriptionSample.id
        })
      }
    })

    return prescriptionSampleList
  }
}
