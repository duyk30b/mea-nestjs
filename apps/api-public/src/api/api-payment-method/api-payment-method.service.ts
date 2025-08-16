import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BusinessError } from '../../../../_libs/database/common/error'
import { PaymentMethodRepository } from '../../../../_libs/database/repositories/payment-method.repository'
import {
  PaymentMethodCreateBody,
  PaymentMethodGetManyQuery,
  PaymentMethodPaginationQuery,
  PaymentMethodUpdateBody,
} from './request'

@Injectable()
export class ApiPaymentMethodService {
  constructor(private readonly paymentMethodRepository: PaymentMethodRepository) { }

  async pagination(oid: number, query: PaymentMethodPaginationQuery) {
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
    return { paymentMethodList: data, total, page, limit }
  }

  async getMany(oid: number, query: PaymentMethodGetManyQuery) {
    const { limit, filter, relation } = query

    const data = await this.paymentMethodRepository.findMany({
      relation,
      condition: {
        oid,
      },
      limit,
    })
    return { paymentMethodList: data }
  }

  async getOne(oid: number, id: number) {
    const paymentMethod = await this.paymentMethodRepository.findOneBy({ oid, id })
    if (!paymentMethod) throw new BusinessException('error.Database.NotFound')
    return { paymentMethod }
  }

  async createOne(oid: number, body: PaymentMethodCreateBody) {
    let code = body.code
    if (!code) {
      const count = await this.paymentMethodRepository.getMaxId()
      code = (count + 1).toString()
    }
    const existPaymentMethod = await this.paymentMethodRepository.findOneBy({ oid, code })
    if (existPaymentMethod) {
      throw new BusinessError(`Trùng mã thanh toán với ${existPaymentMethod.name}`)
    }

    const paymentMethod = await this.paymentMethodRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...body,
      code,
    })
    return { paymentMethod }
  }

  async updateOne(options: {
    oid: number
    paymentMethodId: number
    body: PaymentMethodUpdateBody
  }) {
    const { body, paymentMethodId, oid } = options

    if (body.code != null) {
      const existPaymentMethod = await this.paymentMethodRepository.findOneBy({
        oid,
        code: body.code,
        id: { NOT: paymentMethodId },
      })
      if (existPaymentMethod) {
        throw new BusinessError(`Trùng mã thanh toán với ${existPaymentMethod.name}`)
      }
    }

    const paymentMethod = await this.paymentMethodRepository.updateOneAndReturnEntity(
      { id: paymentMethodId, oid },
      body
    )
    return { paymentMethod }
  }

  async destroyOne(options: { oid: number; paymentMethodId: number }) {
    const { oid, paymentMethodId } = options
    await this.paymentMethodRepository.delete({ oid, id: paymentMethodId })

    return { paymentMethodId }
  }
}
