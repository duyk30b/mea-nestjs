import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers/array.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Laboratory, Procedure, Product, Radiology } from '../../../../_libs/database/entities'
import Position, {
    PositionInsertType,
    PositionInteractType,
} from '../../../../_libs/database/entities/position.entity'
import {
    LaboratoryRepository,
    ProcedureRepository,
    ProductRepository,
    RadiologyRepository,
} from '../../../../_libs/database/repositories'
import { PositionRepository } from '../../../../_libs/database/repositories/position.repository'
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
export class ApiPositionService {
  constructor(
    private readonly positionRepository: PositionRepository,
    private readonly productRepository: ProductRepository,
    private readonly procedureRepository: ProcedureRepository,
    private readonly radiologyRepository: RadiologyRepository,
    private readonly laboratoryRepository: LaboratoryRepository
  ) { }

  async pagination(oid: number, query: PositionPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.positionRepository.pagination({
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
      await this.generateRelation(data, query.relation)
    }
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: PositionGetManyQuery): Promise<BaseResponse> {
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
    return { data: { positionList } }
  }

  async getOne(oid: number, id: number, query: PositionGetOneQuery): Promise<BaseResponse> {
    const position = await this.positionRepository.findOne({
      relation: { role: query?.relation?.role },
      condition: { oid, id },
    })
    if (!position) throw new BusinessException('error.Database.NotFound')
    if (query.relation) {
      await this.generateRelation([position], query.relation)
    }
    return { data: { position } }
  }

  async createOne(oid: number, body: PositionCreateBody): Promise<BaseResponse> {
    const existPosition = await this.positionRepository.findOneBy({
      oid,
      roleId: body.roleId,
      positionType: body.positionType,
      positionInteractId: body.positionInteractId,
    })
    if (existPosition) {
      throw new BusinessException('error.Conflict', {
        obj:
          `Không thể tạo bản ghi trùng lặp. `
          + `Đã tồn tại bản ghi nội dung tương tự với id = ${existPosition.id}`,
      })
    }

    const position = await this.positionRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      oid,
    })
    return { data: { position } }
  }

  async updateOne(oid: number, id: number, body: PositionUpdateBody): Promise<BaseResponse> {
    const existPosition = await this.positionRepository.findOneBy({
      id: { NOT: id },
      oid,
      roleId: body.roleId,
      positionType: body.positionType,
      positionInteractId: body.positionInteractId,
    })
    if (existPosition) {
      throw new BusinessException('error.Conflict', {
        obj:
          `Không thể tạo bản ghi trùng lặp. `
          + `Đã tồn tại bản ghi nội dung tương tự với id = ${existPosition.id}`,
      })
    }
    const positionList = await this.positionRepository.updateAndReturnEntity({ id, oid }, body)
    return { data: { position: positionList[0] } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.positionRepository.delete({ oid, id })
    if (affected === 0) throw new BusinessException('error.Database.DeleteFailed')

    return { data: true }
  }

  async replaceList(oid: number, body: PositionReplaceListBody): Promise<BaseResponse> {
    await this.positionRepository.delete({
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

    const positionList =
      await this.positionRepository.insertManyAndReturnEntity(positionInsertListDto)

    return { data: { positionList } }
  }

  async generateRelation(positionList: Position[], relation: PositionRelationQuery) {
    const productIdList = positionList
      .filter((i) => i.positionType === PositionInteractType.Product)
      .map((i) => i.positionInteractId)
    const procedureIdList = positionList
      .filter((i) => i.positionType === PositionInteractType.Procedure)
      .map((i) => i.positionInteractId)
    const radiologyIdList = positionList
      .filter((i) => i.positionType === PositionInteractType.Radiology)
      .map((i) => i.positionInteractId)
    const laboratoryIdList = positionList
      .filter((i) => i.positionType === PositionInteractType.Laboratory)
      .map((i) => i.positionInteractId)

    const [productList, procedureList, radiologyList, laboratoryList] = await Promise.all([
      relation?.product && productIdList.length
        ? this.productRepository.findManyBy({ id: { IN: ESArray.uniqueArray(productIdList) } })
        : <Product[]>[],
      relation?.procedure && procedureIdList.length
        ? this.procedureRepository.findMany({
          condition: { id: { IN: ESArray.uniqueArray(procedureIdList) } },
        })
        : <Procedure[]>[],
      relation?.radiology && radiologyIdList.length
        ? this.radiologyRepository.findManyBy({ id: { IN: ESArray.uniqueArray(radiologyIdList) } })
        : <Radiology[]>[],
      relation?.laboratory && laboratoryIdList.length
        ? this.laboratoryRepository.findMany({
          condition: { id: { IN: ESArray.uniqueArray(laboratoryIdList) } },
        })
        : <Laboratory[]>[],
    ])

    positionList.forEach((position: Position) => {
      if (position.positionType === PositionInteractType.Product) {
        position.product = productList.find((i) => i.id === position.positionInteractId)
      }
      if (position.positionType === PositionInteractType.Procedure) {
        position.procedure = procedureList.find((i) => i.id === position.positionInteractId)
      }
      if (position.positionType === PositionInteractType.Radiology) {
        position.radiology = radiologyList.find((i) => i.id === position.positionInteractId)
      }
      if (position.positionType === PositionInteractType.Laboratory) {
        position.laboratory = laboratoryList.find((i) => i.id === position.positionInteractId)
      }
    })

    return positionList
  }
}
