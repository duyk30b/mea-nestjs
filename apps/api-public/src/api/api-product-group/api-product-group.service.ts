import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { ProductGroupInsertType } from '../../../../_libs/database/entities/product-group.entity'
import { ProductGroupRepository } from '../../../../_libs/database/repositories/product-group.repository'
import {
  ProductGroupCreateBody,
  ProductGroupGetManyQuery,
  ProductGroupPaginationQuery,
  ProductGroupReplaceAllBody,
  ProductGroupUpdateBody,
} from './request'

@Injectable()
export class ApiProductGroupService {
  constructor(private readonly productGroupRepository: ProductGroupRepository) { }

  async pagination(oid: number, query: ProductGroupPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.productGroupRepository.pagination({
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

  async getMany(oid: number, query: ProductGroupGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query

    const data = await this.productGroupRepository.findMany({
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
    const data = await this.productGroupRepository.findOneBy({ oid, id })
    if (!data) throw new BusinessException('error.Database.NotFound')
    return { data }
  }

  async replaceAll(oid: number, body: ProductGroupReplaceAllBody): Promise<BaseResponse> {
    await this.productGroupRepository.replaceAll(oid, body.productGroupReplaceAll)
    return { data: true }
  }

  async createOne(oid: number, body: ProductGroupCreateBody): Promise<BaseResponse> {
    const id = await this.productGroupRepository.insertOneBasic({ oid, ...body })
    const data = await this.productGroupRepository.findOneById(id)
    return { data }
  }

  async updateOne(oid: number, id: number, body: ProductGroupUpdateBody): Promise<BaseResponse> {
    const affected = await this.productGroupRepository.updateBasic({ id, oid }, body)
    const data = await this.productGroupRepository.findOneBy({ oid, id })
    return { data }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.productGroupRepository.deleteBasic({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { data: true }
  }

  async createByGroupName(oid: number, groupName: string[]) {
    const productGroupAll = await this.productGroupRepository.findManyBy({ oid })
    const groupNameList = productGroupAll.map((i) => i.name)

    const groupNameClean = ESArray.uniqueArray(groupName).filter((i) => !!i)
    const groupNameNoExist = groupNameClean.filter((i) => {
      return !groupNameList.includes(i)
    })
    const lgCreateList = groupNameNoExist.map((i) => {
      const dto: ProductGroupInsertType = {
        oid,
        name: i,
      }
      return dto
    })
    const lgInsertedList = await this.productGroupRepository.insertMany(lgCreateList)

    return [...productGroupAll, ...lgInsertedList]
  }
}
