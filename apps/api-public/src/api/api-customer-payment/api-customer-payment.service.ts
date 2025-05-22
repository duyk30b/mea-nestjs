import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { CustomerPaymentRepository } from '../../../../_libs/database/repositories/customer-payment.repository'
import {
  CustomerPaymentGetManyQuery,
  CustomerPaymentPaginationQuery,
  CustomerPaymentPayDebtBody,
} from './request'

@Injectable()
export class ApiCustomerPaymentService {
  constructor(
    private readonly customerPaymentRepository: CustomerPaymentRepository
  ) { }

  async pagination(oid: number, query: CustomerPaymentPaginationQuery): Promise<BaseResponse> {
    const { page, limit, relation, filter, sort } = query
    const { data, total } = await this.customerPaymentRepository.pagination({
      relationLoadStrategy: 'query',
      relation: {
        customer: relation?.customer,
        ticket: relation?.ticket,
        paymentMethod: relation?.paymentMethod,
      },
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        ticketId: filter?.ticketId,
        paymentType: filter?.paymentType,
      },
      sort,
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: CustomerPaymentGetManyQuery): Promise<BaseResponse> {
    const { relation, filter, limit, sort } = query

    const data = await this.customerPaymentRepository.findMany({
      relationLoadStrategy: 'query',
      relation: {
        customer: relation?.customer,
        ticket: relation?.ticket,
        paymentMethod: relation?.paymentMethod,
      },
      condition: {
        oid,
        customerId: filter?.customerId,
        ticketId: filter?.ticketId,
        paymentType: filter?.paymentType,
      },
      limit,
      sort,
    })
    return { data }
  }

  async startPayDebt(oid: number, body: CustomerPaymentPayDebtBody): Promise<BaseResponse> {
    try {
      const { customer } = await this.customerPaymentRepository.startPayDebt({
        oid,
        customerId: body.customerId,
        paymentMethodId: body.paymentMethodId,
        time: Date.now(),
        ticketPaymentList: body.ticketPaymentList,
        note: body.note,
      })
      return { data: { customer } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
