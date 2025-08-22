import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BusinessError } from '../../../../_libs/database/common/error'
import { SurchargeRepository } from '../../../../_libs/database/repositories/surcharge.repository'
import {
  SurchargeCreateBody,
  SurchargeGetManyQuery,
  SurchargePaginationQuery,
  SurchargeUpdateBody,
} from './request'

@Injectable()
export class ApiSurchargeService {
  constructor(private readonly surchargeRepository: SurchargeRepository) { }

  async pagination(oid: number, query: SurchargePaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.surchargeRepository.pagination({
      page,
      limit,
      relation,
      condition: { oid },
      sort,
    })
    return { surchargeList: data, total, page, limit }
  }

  async getMany(oid: number, query: SurchargeGetManyQuery) {
    const { limit, filter, relation } = query

    const data = await this.surchargeRepository.findMany({
      relation,
      condition: {
        oid,
      },
      limit,
    })
    return { surchargeList: data }
  }

  async getOne(oid: number, id: number) {
    const surcharge = await this.surchargeRepository.findOneBy({ oid, id })
    if (!surcharge) throw new BusinessException('error.Database.NotFound')
    return { surcharge }
  }

  async createOne(oid: number, body: SurchargeCreateBody) {
    let code = body.code
    if (!code) {
      const count = await this.surchargeRepository.getMaxId()
      code = (count + 1).toString()
    }
    const existSurcharge = await this.surchargeRepository.findOneBy({ oid, code })
    if (existSurcharge) {
      throw new BusinessError(`Trùng mã phụ phí với ${existSurcharge.name}`)
    }

    const surcharge = await this.surchargeRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...body,
      code,
    })
    return { surcharge }
  }

  async updateOne(options: { oid: number; surchargeId: number; body: SurchargeUpdateBody }) {
    const { oid, surchargeId, body } = options

    if (body.code != null) {
      const existSurcharge = await this.surchargeRepository.findOneBy({
        oid,
        code: body.code,
        id: { NOT: surchargeId },
      })
      if (existSurcharge) {
        throw new BusinessError(`Trùng mã phụ phí với ${existSurcharge.name}`)
      }
    }

    const surcharge = await this.surchargeRepository.updateOneAndReturnEntity(
      { id: surchargeId, oid },
      body
    )
    return { surcharge }
  }

  async destroyOne(options: { oid: number; surchargeId: number }) {
    const { oid, surchargeId } = options
    await this.surchargeRepository.delete({ oid, id: surchargeId })

    return { surchargeId }
  }
}
