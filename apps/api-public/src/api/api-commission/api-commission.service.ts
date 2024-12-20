import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { CommissionRepository } from '../../../../_libs/database/repositories/commission.repository'
import {
  CommissionCreateBody,
  CommissionGetManyQuery,
  CommissionPaginationQuery,
  CommissionUpdateBody,
} from './request'

@Injectable()
export class ApiCommissionService {
  constructor(private readonly commissionRepository: CommissionRepository) { }

  async pagination(oid: number, query: CommissionPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.commissionRepository.pagination({
      relation,
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
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: CommissionGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query

    const data = await this.commissionRepository.findMany({
      relation,
      condition: {
        oid,
        interactType: filter?.interactType,
        roleId: filter?.roleId,
        interactId: filter?.interactId,
      },
      limit,
      sort,
    })
    return { data }
  }

  async getOne(oid: number, id: number): Promise<BaseResponse> {
    const commission = await this.commissionRepository.findOneBy({ oid, id })
    if (!commission) throw new BusinessException('error.Database.NotFound')
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
}
