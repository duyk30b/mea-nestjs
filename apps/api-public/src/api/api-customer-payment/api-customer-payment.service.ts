import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { CustomerPaymentRepository } from '../../../../_libs/database/repository/customer-payment/customer-payment.repository'
import { TicketRepository } from '../../../../_libs/database/repository/ticket/ticket-base/ticket.repository'
import {
  CustomerPaymentGetManyQuery,
  CustomerPaymentPaginationQuery,
  CustomerPaymentPayDebtBody,
} from './request'

@Injectable()
export class ApiCustomerPaymentService {
  constructor(
    private readonly customerPaymentRepository: CustomerPaymentRepository,
    private readonly ticketRepository: TicketRepository
  ) { }

  async pagination(oid: number, query: CustomerPaymentPaginationQuery): Promise<BaseResponse> {
    const { page, limit, relation, filter, sort } = query
    const { data, total } = await this.customerPaymentRepository.pagination({
      relation: {
        customer: relation?.customer,
        ticket: relation?.ticket,
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
      relation: {
        customer: relation?.customer,
        ticket: relation?.ticket,
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
