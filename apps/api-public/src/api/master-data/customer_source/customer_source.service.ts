import { BusinessException } from '@libs/common/exception-filter/exception-filter'
import { ESArray } from '@libs/common/helpers'
import { GenerateId } from '@libs/database/common/generate-id'
import { CustomerSourceInsertType } from '@libs/database/entities/customer-source.entity'
import { CustomerSourceRepository } from '@libs/database/repositories/customer-source.repository'
import { Injectable } from '@nestjs/common'
import {
  CustomerSourceCreateBody,
  CustomerSourceGetManyQuery,
  CustomerSourcePaginationQuery,
  CustomerSourceUpdateBody,
} from './request'

@Injectable()
export class CustomerSourceService {
  constructor(private readonly customerSourceRepository: CustomerSourceRepository) { }

  async pagination(oid: number, query: CustomerSourcePaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data: customerSourceList, total } = await this.customerSourceRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
      },
      sort,
    })
    return { customerSourceList, total, page, limit }
  }

  async getMany(oid: number, query: CustomerSourceGetManyQuery) {
    const { limit, filter, relation } = query

    const customerSourceList = await this.customerSourceRepository.findMany({
      relation,
      condition: {
        oid,
      },
      limit,
    })
    return { customerSourceList }
  }

  async getOne(oid: number, id: number) {
    const customerSource = await this.customerSourceRepository.findOneBy({ oid, id })
    if (!customerSource) throw new BusinessException('error.Database.NotFound')
    return { customerSource }
  }

  async createOne(oid: number, body: CustomerSourceCreateBody) {
    const id = await this.customerSourceRepository.insertOneBasic({ oid, ...body })
    const customerSource = await this.customerSourceRepository.findOneById(id)
    return { customerSource }
  }

  async updateOne(oid: number, id: number, body: CustomerSourceUpdateBody) {
    const affected = await this.customerSourceRepository.updateBasic({ id, oid }, body)
    const customerSource = await this.customerSourceRepository.findOneBy({ oid, id })
    return { customerSource }
  }

  async destroyOne(oid: number, id: number) {
    const affected = await this.customerSourceRepository.deleteBasic({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { customerSourceId: id }
  }

  async createBySourceName(oid: number, sourceNameList: string[]) {
    const customerSourceExistAll = await this.customerSourceRepository.findManyBy({ oid })
    const sourceNameListExist = customerSourceExistAll.map((i) => i.name)

    const sourceNameClean = ESArray.uniqueArray(sourceNameList).filter((i) => !!i)
    const sourceNameNoExist = sourceNameClean.filter((i) => {
      return !sourceNameListExist.includes(i)
    })
    const customerSourceCreateList = sourceNameNoExist.map((i) => {
      const dto: CustomerSourceInsertType = {
        oid,
        name: i,
      }
      return dto
    })
    const customerSourceInsertedList =
      await this.customerSourceRepository.insertMany(customerSourceCreateList)

    return [...customerSourceExistAll, ...customerSourceInsertedList]
  }
}
