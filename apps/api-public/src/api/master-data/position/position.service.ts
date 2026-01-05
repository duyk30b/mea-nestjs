import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../../_libs/common/helpers/array.helper'
import {
  Laboratory,
  LaboratoryGroup,
  Procedure,
  Product,
  Radiology,
  Regimen,
} from '../../../../../_libs/database/entities'
import Position, {
  PositionInsertType,
  PositionType,
} from '../../../../../_libs/database/entities/position.entity'
import {
  LaboratoryGroupRepository,
  LaboratoryRepository,
  ProcedureRepository,
  ProductRepository,
  RadiologyRepository,
  RegimenRepository,
} from '../../../../../_libs/database/repositories'
import { PositionRepository } from '../../../../../_libs/database/repositories/position.repository'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  PositionCreateBody,
  PositionGetManyQuery,
  PositionGetOneQuery,
  PositionPaginationQuery,
  PositionRelationQuery,
  PositionReplaceListBody,
  PositionUpdateBody,
} from './request'

@Injectable()
export class PositionService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly positionRepository: PositionRepository,
    private readonly productRepository: ProductRepository,
    private readonly regimenRepository: RegimenRepository,
    private readonly procedureRepository: ProcedureRepository,
    private readonly radiologyRepository: RadiologyRepository,
    private readonly laboratoryRepository: LaboratoryRepository,
    private readonly laboratoryGroupRepository: LaboratoryGroupRepository
  ) { }

  async pagination(oid: number, query: PositionPaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data: positionList, total } = await this.positionRepository.pagination({
      relation: {
        role: relation?.role,
      },
      page,
      limit,
      condition: {
        oid,
        positionType: filter?.positionType,
        roleId: filter?.roleId,
        positionInteractId: filter?.positionInteractId,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation(positionList, query.relation)
    }
    return { positionList, total, page, limit }
  }

  async getMany(oid: number, query: PositionGetManyQuery) {
    const { limit, filter, relation, sort } = query

    const positionList = await this.positionRepository.findMany({
      relation: {
        role: relation?.role,
      },
      condition: {
        oid,
        positionType: filter?.positionType,
        roleId: filter?.roleId,
        positionInteractId: filter?.positionInteractId,
      },
      limit,
      sort,
    })

    if (query.relation) {
      await this.generateRelation(positionList, query.relation)
    }
    return { positionList }
  }

  async getOne(oid: number, id: number, query: PositionGetOneQuery) {
    const position = await this.positionRepository.findOne({
      relation: { role: query?.relation?.role },
      condition: { oid, id },
    })
    if (!position) throw new BusinessException('error.Database.NotFound')
    if (query.relation) {
      await this.generateRelation([position], query.relation)
    }
    return { position }
  }

  async createOne(oid: number, body: PositionCreateBody) {
    const position = await this.positionRepository.insertOne({
      ...body,
      oid,
    })
    this.socketEmitService.socketMasterDataChange(oid, { position: true })
    return { position }
  }

  async updateOne(oid: number, id: number, body: PositionUpdateBody) {
    const position = await this.positionRepository.updateOne({ id, oid }, body)
    this.socketEmitService.socketMasterDataChange(oid, { position: true })
    return { position }
  }

  async destroyOne(oid: number, id: number) {
    const affected = await this.positionRepository.deleteBasic({ oid, id })
    if (affected === 0) throw new BusinessException('error.Database.DeleteFailed')
    this.socketEmitService.socketMasterDataChange(oid, { position: true })
    return { data: true }
  }

  async replaceList(oid: number, body: PositionReplaceListBody) {
    await this.positionRepository.deleteBasic({
      oid,
      positionType: body.filter?.positionType,
    })

    const positionInsertListDto: PositionInsertType[] = body.positionData.map((i) => {
      const dto: PositionInsertType = {
        ...i,
        oid,
      }
      return dto
    })

    const positionList = await this.positionRepository.insertMany(positionInsertListDto)
    this.socketEmitService.socketMasterDataChange(oid, { position: true })
    return { positionList }
  }

  async generateRelation(positionList: Position[], relation: PositionRelationQuery) {
    const productIdList = positionList
      .filter((i) => [PositionType.ProductRequest].includes(i.positionType))
      .map((i) => i.positionInteractId)
    const regimenIdList = positionList
      .filter((i) => [PositionType.RegimenRequest].includes(i.positionType))
      .map((i) => i.positionInteractId)
    const procedureIdList = positionList
      .filter((i) =>
        [PositionType.ProcedureRequest, PositionType.ProcedureResult].includes(i.positionType))
      .map((i) => i.positionInteractId)
    const radiologyIdList = positionList
      .filter((i) =>
        [PositionType.RadiologyRequest, PositionType.RadiologyResult].includes(i.positionType))
      .map((i) => i.positionInteractId)
    const laboratoryIdList = positionList
      .filter((i) => [PositionType.LaboratoryRequest].includes(i.positionType))
      .map((i) => i.positionInteractId)
    const laboratoryGroupIdList = positionList
      .filter((i) => [PositionType.LaboratoryRequest].includes(i.positionType))
      .map((i) => i.positionInteractId)

    const [
      productList,
      regimenList,
      procedureList,
      radiologyList,
      laboratoryList,
      laboratoryGroupList,
    ] = await Promise.all([
      relation?.productRequest && productIdList.length
        ? this.productRepository.findManyBy({ id: { IN: ESArray.uniqueArray(productIdList) } })
        : <Product[]>[],
      relation?.regimenRequest && regimenIdList.length
        ? this.regimenRepository.findMany({
          condition: { id: { IN: ESArray.uniqueArray(procedureIdList) } },
        })
        : <Regimen[]>[],
      (relation?.procedureRequest || relation?.procedureResult) && procedureIdList.length
        ? this.procedureRepository.findMany({
          condition: { id: { IN: ESArray.uniqueArray(procedureIdList) } },
        })
        : <Procedure[]>[],
      (relation?.radiologyRequest || relation?.radiologyResult) && radiologyIdList.length
        ? this.radiologyRepository.findManyBy({
          id: { IN: ESArray.uniqueArray(radiologyIdList) },
        })
        : <Radiology[]>[],
      relation?.laboratoryRequest && laboratoryIdList.length
        ? this.laboratoryRepository.findMany({
          condition: { id: { IN: ESArray.uniqueArray(laboratoryIdList) } },
        })
        : <Laboratory[]>[],
      (relation?.laboratoryGroupRequest || relation?.laboratoryGroupResult)
        && laboratoryGroupIdList.length
        ? this.laboratoryGroupRepository.findMany({
          condition: { id: { IN: ESArray.uniqueArray(laboratoryIdList) } },
        })
        : <LaboratoryGroup[]>[],
    ])

    const productMap = ESArray.arrayToKeyValue(productList, 'id')
    const regimenMap = ESArray.arrayToKeyValue(regimenList, 'id')
    const procedureMap = ESArray.arrayToKeyValue(procedureList, 'id')
    const radiologyMap = ESArray.arrayToKeyValue(radiologyList, 'id')
    const laboratoryMap = ESArray.arrayToKeyValue(laboratoryList, 'id')
    const laboratoryGroupMap = ESArray.arrayToKeyValue(laboratoryGroupList, 'id')

    positionList.forEach((position: Position) => {
      if (position.positionType === PositionType.ProductRequest) {
        position.productRequest = productMap[position.positionInteractId]
      }
      if (position.positionType === PositionType.RegimenRequest) {
        position.regimenRequest = regimenMap[position.positionInteractId]
      }
      if (position.positionType === PositionType.ProcedureResult) {
        position.procedureResult = procedureMap[position.positionInteractId]
      }
      if (position.positionType === PositionType.RadiologyRequest) {
        position.radiologyRequest = radiologyMap[position.positionInteractId]
      }
      if (position.positionType === PositionType.RadiologyResult) {
        position.radiologyResult = radiologyMap[position.positionInteractId]
      }
      if (position.positionType === PositionType.LaboratoryRequest) {
        position.laboratoryRequest = laboratoryMap[position.positionInteractId]
      }
      if (position.positionType === PositionType.LaboratoryGroupRequest) {
        position.laboratoryGroupRequest = laboratoryGroupMap[position.positionInteractId]
      }
      if (position.positionType === PositionType.LaboratoryGroupResult) {
        position.laboratoryGroupResult = laboratoryGroupMap[position.positionInteractId]
      }
    })

    return positionList
  }
}
