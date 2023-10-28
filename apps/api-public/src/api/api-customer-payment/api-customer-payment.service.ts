import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { CustomerPaymentRepository } from '../../../../_libs/database/repository/customer/customer-payment.repository'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { CustomerPaymentPaginationQuery, CustomerPaymentPayDebtBody } from './request'

@Injectable()
export class ApiCustomerPaymentService {
  constructor(
    private readonly customerPaymentRepository: CustomerPaymentRepository,
    private readonly customerRepository: CustomerRepository
  ) {}

  async pagination(oid: number, query: CustomerPaymentPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort } = query
    const { data, total } = await this.customerPaymentRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
      },
      sort: sort || { id: 'DESC' },
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async startPayDebt(oid: number, body: CustomerPaymentPayDebtBody): Promise<BaseResponse> {
    try {
      const { customerId } = await this.customerPaymentRepository.startPayDebt({
        oid,
        customerId: body.customerId,
        time: Date.now(),
        invoicePayments: body.invoicePayments,
        note: body.note,
      })
      const customer = await this.customerRepository.findOneBy({ id: customerId })
      return { data: { customer } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
