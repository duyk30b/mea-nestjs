import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { PaymentRepository } from '../../../../_libs/database/repositories'
import { PaymentMethodRepository } from '../../../../_libs/database/repositories/payment-method.repository'
import {
  PaymentMethodCreateBody,
  PaymentMethodGetManyQuery,
  PaymentMethodPaginationQuery,
  PaymentMethodUpdateBody,
} from './request'

@Injectable()
export class ApiPaymentMethodService {
  constructor(
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly paymentRepository: PaymentRepository
  ) { }

  async pagination(oid: number, query: PaymentMethodPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.paymentMethodRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
      },
      sort,
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: PaymentMethodGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query

    const data = await this.paymentMethodRepository.findMany({
      relation,
      condition: {
        oid,
      },
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number): Promise<BaseResponse> {
    const paymentMethod = await this.paymentMethodRepository.findOneBy({ oid, id })
    if (!paymentMethod) throw new BusinessException('error.Database.NotFound')
    return { data: { paymentMethod } }
  }

  async createOne(oid: number, body: PaymentMethodCreateBody): Promise<BaseResponse> {
    const paymentMethod = await this.paymentMethodRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...body,
    })
    return { data: { paymentMethod } }
  }

  async updateOne(oid: number, id: number, body: PaymentMethodUpdateBody): Promise<BaseResponse> {
    const [paymentMethod] = await this.paymentMethodRepository.updateAndReturnEntity(
      { id, oid },
      body
    )
    if (!paymentMethod) {
      throw BusinessException.create({
        message: 'error.Database.UpdateFailed',
        details: 'PaymentMethod',
      })
    }
    return { data: { paymentMethod } }
  }

  async destroyOne(options: { oid: number; paymentMethodId: number }): Promise<BaseResponse> {
    const { oid, paymentMethodId } = options
    await Promise.all([
      this.paymentMethodRepository.delete({ oid, id: paymentMethodId }),
      this.paymentRepository.update({ oid, paymentMethodId }, { paymentMethodId: 0 }),
    ])

    return { data: { paymentMethodId } }
  }
}
