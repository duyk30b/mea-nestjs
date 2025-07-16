import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { BatchRepository } from '../../../../_libs/database/repositories/batch.repository'
import { WarehouseRepository } from '../../../../_libs/database/repositories/warehouse.repository'
import {
  WarehouseCreateBody,
  WarehouseGetManyQuery,
  WarehousePaginationQuery,
  WarehouseUpdateBody,
} from './request'

@Injectable()
export class ApiWarehouseService {
  constructor(
    private readonly warehouseRepository: WarehouseRepository,
    private readonly batchRepository: BatchRepository
  ) { }

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
    const warehouse = await this.warehouseRepository.findOneBy({ oid, id })
    if (!warehouse) throw new BusinessException('error.Database.NotFound')
    return { data: { warehouse } }
  }

  async createOne(oid: number, body: WarehouseCreateBody): Promise<BaseResponse> {
    const warehouse = await this.warehouseRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...body,
    })
    return { data: { warehouse } }
  }

  async updateOne(oid: number, id: number, body: WarehouseUpdateBody): Promise<BaseResponse> {
    const [warehouse] = await this.warehouseRepository.updateAndReturnEntity({ id, oid }, body)
    if (!warehouse) {
      throw BusinessException.create({
        message: 'error.Database.UpdateFailed',
        details: 'Warehouse',
      })
    }
    return { data: { warehouse } }
  }

  async destroyOne(options: { oid: number; warehouseId: number }): Promise<BaseResponse> {
    const { oid, warehouseId } = options
    const countBatch = await this.batchRepository.countBy({ oid, warehouseId })
    if (countBatch > 0) {
      return {
        data: { countBatch },
        success: false,
      }
    }
    await this.warehouseRepository.delete({ oid, id: warehouseId })

    return { data: { countBatch: 0, warehouseId } }
  }
}
