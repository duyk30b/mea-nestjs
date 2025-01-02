import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Laboratory, Procedure, Product, Radiology } from '../../../../_libs/database/entities'
import Commission, {
  CommissionInsertType,
  InteractType,
} from '../../../../_libs/database/entities/commission.entity'
import {
  LaboratoryRepository,
  ProcedureRepository,
  ProductRepository,
  RadiologyRepository,
} from '../../../../_libs/database/repositories'
import { CommissionRepository } from '../../../../_libs/database/repositories/commission.repository'
import {
  CommissionCreateBody,
  CommissionGetManyQuery,
  CommissionGetOneQuery,
  CommissionPaginationQuery,
  CommissionRelationQuery,
  CommissionReplaceListBody,
  CommissionUpdateBody,
} from './request'

@Injectable()
export class ApiCommissionService {
  constructor(
    private readonly commissionRepository: CommissionRepository,
    private readonly productRepository: ProductRepository,
    private readonly procedureRepository: ProcedureRepository,
    private readonly radiologyRepository: RadiologyRepository,
    private readonly laboratoryRepository: LaboratoryRepository
  ) { }

  async pagination(oid: number, query: CommissionPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.commissionRepository.pagination({
      relation: {
        role: relation?.role,
      },
      page,
      limit,
      condition: {
        oid,
        interactType: filter?.interactType,
        roleId: filter?.roleId,
        interactId: filter?.interactId,
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

  async getMany(oid: number, query: CommissionGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query

    const data = await this.commissionRepository.findMany({
      relation: {
        role: relation?.role,
      },
      condition: {
        oid,
        interactType: filter?.interactType,
        roleId: filter?.roleId,
        interactId: filter?.interactId,
      },
      limit,
      sort,
    })

    if (query.relation) {
      await this.generateRelation(data, query.relation)
    }
    return { data }
  }

  async getOne(oid: number, id: number, query: CommissionGetOneQuery): Promise<BaseResponse> {
    const commission = await this.commissionRepository.findOne({
      relation: { role: query?.relation?.role },
      condition: { oid, id },
    })
    if (!commission) throw new BusinessException('error.Database.NotFound')
    if (query.relation) {
      await this.generateRelation([commission], query.relation)
    }
    return { data: { commission } }
  }

  async createOne(oid: number, body: CommissionCreateBody): Promise<BaseResponse> {
    const existCommission = await this.commissionRepository.findOneBy({
      oid,
      roleId: body.roleId,
      interactType: body.interactType,
      interactId: body.interactId,
    })
    if (existCommission) {
      throw new BusinessException('error.Conflict', {
        obj:
          `Không thể tạo bản ghi trùng lặp. `
          + `Đã tồn tại bản ghi nội dung tương tự với id = ${existCommission.id}`,
      })
    }

    const commission = await this.commissionRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      oid,
    })
    return { data: { commission } }
  }

  async updateOne(oid: number, id: number, body: CommissionUpdateBody): Promise<BaseResponse> {
    const existCommission = await this.commissionRepository.findOneBy({
      id: { NOT: id },
      oid,
      roleId: body.roleId,
      interactType: body.interactType,
      interactId: body.interactId,
    })
    if (existCommission) {
      throw new BusinessException('error.Conflict', {
        obj:
          `Không thể tạo bản ghi trùng lặp. `
          + `Đã tồn tại bản ghi nội dung tương tự với id = ${existCommission.id}`,
      })
    }
    const commissionList = await this.commissionRepository.updateAndReturnEntity({ id, oid }, body)
    return { data: { commission: commissionList[0] } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.commissionRepository.delete({ oid, id })
    if (affected === 0) throw new BusinessException('error.Database.DeleteFailed')

    return { data: true }
  }

  async replaceList(oid: number, body: CommissionReplaceListBody): Promise<BaseResponse> {
    await this.commissionRepository.delete({
      oid,
      interactType: body.filter?.interactType,
    })

    const commissionInsertListDto: CommissionInsertType[] = body.commissionData.map((i) => {
      const dto: CommissionInsertType = {
        ...i,
        oid,
      }
      return dto
    })

    const commissionList =
      await this.commissionRepository.insertManyAndReturnEntity(commissionInsertListDto)

    return { data: { commissionList } }
  }

  async generateRelation(data: Commission[], relation: CommissionRelationQuery) {
    const productIdList = data
      .filter((i) => i.interactType === InteractType.Product)
      .map((i) => i.interactId)
    const procedureIdList = data
      .filter((i) => i.interactType === InteractType.Procedure)
      .map((i) => i.interactId)
    const radiologyIdList = data
      .filter((i) => i.interactType === InteractType.Radiology)
      .map((i) => i.interactId)
    const laboratoryIdList = data
      .filter((i) => i.interactType === InteractType.Laboratory)
      .map((i) => i.interactId)

    const [productList, procedureList, radiologyList, laboratoryList] = await Promise.all([
      relation?.product && productIdList.length
        ? this.productRepository.findManyBy({ id: { IN: uniqueArray(productIdList) } })
        : <Product[]>[],
      relation?.procedure && procedureIdList.length
        ? this.procedureRepository.findMany({
          condition: { id: { IN: uniqueArray(procedureIdList) } },
        })
        : <Procedure[]>[],
      relation?.radiology && radiologyIdList.length
        ? this.radiologyRepository.findManyBy({ id: { IN: uniqueArray(radiologyIdList) } })
        : <Radiology[]>[],
      relation?.laboratory && laboratoryIdList.length
        ? this.laboratoryRepository.findMany({
          condition: { id: { IN: uniqueArray(laboratoryIdList) } },
        })
        : <Laboratory[]>[],
    ])

    data.forEach((commission: Commission) => {
      if (commission.interactType === InteractType.Product) {
        commission.product = productList.find((i) => i.id === commission.interactId)
      }
      if (commission.interactType === InteractType.Procedure) {
        commission.procedure = procedureList.find((i) => i.id === commission.interactId)
      }
      if (commission.interactType === InteractType.Radiology) {
        commission.radiology = radiologyList.find((i) => i.id === commission.interactId)
      }
      if (commission.interactType === InteractType.Laboratory) {
        commission.laboratory = laboratoryList.find((i) => i.id === commission.interactId)
      }
    })

    return data
  }
}
