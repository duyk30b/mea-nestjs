import { BusinessException } from '@libs/common/exception-filter/exception-filter'
import { ESArray } from '@libs/common/helpers'
import { Laboratory, Procedure, Product, Radiology, Regimen } from '@libs/database/entities'
import Discount, { DiscountInteractType } from '@libs/database/entities/discount.entity'
import {
  DiscountRepository,
  LaboratoryRepository,
  ProcedureRepository,
  ProductRepository,
  RadiologyRepository,
  RegimenRepository,
} from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { DiscountGetManyQuery, DiscountGetOneQuery } from './discount-get.request'
import { DiscountRelationQuery } from './discount-options.request'
import { DiscountCreateBody, DiscountUpdateBody } from './discount-upsert.body'

@Injectable()
export class DiscountResource {
  constructor(
    private readonly discountRepository: DiscountRepository,
    private readonly productRepository: ProductRepository,
    private readonly regimenRepository: RegimenRepository,
    private readonly procedureRepository: ProcedureRepository,
    private readonly radiologyRepository: RadiologyRepository,
    private readonly laboratoryRepository: LaboratoryRepository
  ) {}

  async getMany(oid: number, query: DiscountGetManyQuery) {
    const { limit, filter, relation, sort } = query

    const discountList = await this.discountRepository.findMany({
      relation: {},
      condition: {
        oid,
        discountInteractId: filter?.discountInteractId,
      },
      limit,
      sort,
    })

    if (query.relation) {
      await this.generateRelation(discountList, query.relation)
    }
    return { discountList }
  }

  async getOne(oid: number, id: number, query: DiscountGetOneQuery) {
    const discount = await this.discountRepository.findOne({
      condition: { oid, id },
    })
    if (!discount) throw new BusinessException('error.Database.NotFound')
    if (query.relation) {
      await this.generateRelation([discount], query.relation)
    }
    return { discount }
  }

  async createOne(oid: number, body: DiscountCreateBody) {
    const discount = await this.discountRepository.insertOne({
      ...body,
      oid,
    })

    return { discount }
  }

  async updateOne(oid: number, id: number, body: DiscountUpdateBody) {
    const discount = await this.discountRepository.updateOne({ id, oid }, body)
    return { discount }
  }

  async destroyOne(oid: number, id: number) {
    const discountDestroyedList = await this.discountRepository.deleteMany({ oid, id })
    return true
  }

  async generateRelation(discountList: Discount[], relation: DiscountRelationQuery) {
    const productIdList = discountList
      .filter((i) => i.discountInteractType === DiscountInteractType.Product)
      .map((i) => i.discountInteractId)
    const regimenIdList = discountList
      .filter((i) => i.discountInteractType === DiscountInteractType.Regimen)
      .map((i) => i.discountInteractId)
    const procedureIdList = discountList
      .filter((i) => i.discountInteractType === DiscountInteractType.Procedure)
      .map((i) => i.discountInteractId)
    const radiologyIdList = discountList
      .filter((i) => i.discountInteractType === DiscountInteractType.Radiology)
      .map((i) => i.discountInteractId)
    const laboratoryIdList = discountList
      .filter((i) => i.discountInteractType === DiscountInteractType.Laboratory)
      .map((i) => i.discountInteractId)

    const [productList, regimenList, procedureList, radiologyList, laboratoryList] =
      await Promise.all([
        relation?.product && productIdList.length
          ? this.productRepository.findManyBy({ id: { IN: ESArray.uniqueArray(productIdList) } })
          : <Product[]>[],
        relation?.regimen && regimenIdList.length
          ? this.regimenRepository.findManyBy({
              id: { IN: ESArray.uniqueArray(regimenIdList) },
            })
          : <Regimen[]>[],
        relation?.procedure && procedureIdList.length
          ? this.procedureRepository.findManyBy({
              id: { IN: ESArray.uniqueArray(procedureIdList) },
            })
          : <Procedure[]>[],
        relation?.radiology && radiologyIdList.length
          ? this.radiologyRepository.findManyBy({
              id: { IN: ESArray.uniqueArray(radiologyIdList) },
            })
          : <Radiology[]>[],
        relation?.laboratory && laboratoryIdList.length
          ? this.laboratoryRepository.findManyBy({
              id: { IN: ESArray.uniqueArray(laboratoryIdList) },
            })
          : <Laboratory[]>[],
      ])
    const productMap = ESArray.arrayToKeyValue(productList, 'id')
    const regimenMap = ESArray.arrayToKeyValue(regimenList, 'id')
    const procedureMap = ESArray.arrayToKeyValue(procedureList, 'id')
    const laboratoryMap = ESArray.arrayToKeyValue(laboratoryList, 'id')
    const radiologyMap = ESArray.arrayToKeyValue(radiologyList, 'id')

    discountList.forEach((discount: Discount) => {
      if (discount.discountInteractType === DiscountInteractType.Product) {
        discount.product = productMap[discount.discountInteractId]
      }
      if (discount.discountInteractType === DiscountInteractType.Regimen) {
        discount.regimen = regimenMap[discount.discountInteractId]
      }
      if (discount.discountInteractType === DiscountInteractType.Procedure) {
        discount.procedure = procedureMap[discount.discountInteractId]
      }
      if (discount.discountInteractType === DiscountInteractType.Radiology) {
        discount.radiology = radiologyMap[discount.discountInteractId]
      }
      if (discount.discountInteractType === DiscountInteractType.Laboratory) {
        discount.laboratory = laboratoryMap[discount.discountInteractId]
      }
    })

    return discountList
  }
}
