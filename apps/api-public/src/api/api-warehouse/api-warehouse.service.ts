import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { WarehouseRepository } from '../../../../_libs/database/repository/warehouse/warehouse.repository'
import {
  WarehouseCreateBody,
  WarehouseGetManyQuery,
  WarehousePaginationQuery,
  WarehouseUpdateBody,
} from './request'

@Injectable()
export class ApiWarehouseService {
  constructor(private readonly warehouseRepository: WarehouseRepository) { }

  async pagination(oid: number, query: WarehousePaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.warehouseRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: WarehouseGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query

    const data = await this.warehouseRepository.findMany({
      relation,
      condition: {
        oid,
        updatedAt: filter?.updatedAt,
      },
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number): Promise<BaseResponse> {
    const data = await this.warehouseRepository.findOneBy({ oid, id })
    if (!data) throw new BusinessException('error.Database.NotFound')
    return { data }
  }

  async createOne(oid: number, body: WarehouseCreateBody): Promise<BaseResponse> {
    const id = await this.warehouseRepository.insertOne({ oid, ...body })
    const data = await this.warehouseRepository.findOneById(id)
    return { data }
  }

  async updateOne(oid: number, id: number, body: WarehouseUpdateBody): Promise<BaseResponse> {
    const affected = await this.warehouseRepository.update({ id, oid }, body)
    const data = await this.warehouseRepository.findOneBy({ oid, id })
    return { data }
  }

  async deleteOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.warehouseRepository.update({ oid, id }, { deletedAt: Date.now() })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    const data = await this.warehouseRepository.findOneById(id)
    return { data }
  }
}
