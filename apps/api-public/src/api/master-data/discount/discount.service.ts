import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../../_libs/common/helpers'
import { BaseResponse } from '../../../../../_libs/common/interceptor/transform-response.interceptor'
import {
  Laboratory,
  Procedure,
  Product,
  Radiology,
  Regimen,
} from '../../../../../_libs/database/entities'
import Discount, {
  DiscountInteractType,
} from '../../../../../_libs/database/entities/discount.entity'
import {
  DiscountRepository,
  LaboratoryRepository,
  ProcedureRepository,
  ProductRepository,
  RadiologyRepository,
  RegimenRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  DiscountCreateBody,
  DiscountGetManyQuery,
  DiscountGetOneQuery,
  DiscountRelationQuery,
  DiscountUpdateBody,
} from './request'

@Injectable()
export class DiscountService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly discountRepository: DiscountRepository,
    private readonly productRepository: ProductRepository,
    private readonly regimenRepository: RegimenRepository,
    private readonly procedureRepository: ProcedureRepository,
    private readonly radiologyRepository: RadiologyRepository,
    private readonly laboratoryRepository: LaboratoryRepository
  ) { }

  async getMany(oid: number, query: DiscountGetManyQuery): Promise<BaseResponse> {
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
    return { data: { discountList } }
  }

  async getOne(oid: number, id: number, query: DiscountGetOneQuery): Promise<BaseResponse> {
    const discount = await this.discountRepository.findOne({
      condition: { oid, id },
    })
    if (!discount) throw new BusinessException('error.Database.NotFound')
    if (query.relation) {
      await this.generateRelation([discount], query.relation)
    }
    return { data: { discount } }
  }

  async createOne(oid: number, body: DiscountCreateBody): Promise<BaseResponse> {
    const discount = await this.discountRepository.insertOne({
      ...body,
      oid,
    })

    this.socketEmitService.socketMasterDataChange(oid, { discount: true })
    return { data: { discount } }
  }

  async updateOne(oid: number, id: number, body: DiscountUpdateBody): Promise<BaseResponse> {
    const discount = await this.discountRepository.updateOne({ id, oid }, body)
    this.socketEmitService.socketMasterDataChange(oid, { discount: true })
    return { data: { discount } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const discountDestroyedList = await this.discountRepository.deleteMany({ oid, id })
    this.socketEmitService.socketMasterDataChange(oid, { discount: true })
    return { data: true }
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
