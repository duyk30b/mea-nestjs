import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { InvoiceStatus } from '../../../../_libs/database/common/variable'
import { VisitStatus } from '../../../../_libs/database/entities/visit.entity'
import { CustomerPaymentRepository } from '../../../../_libs/database/repository/customer-payment/customer-payment.repository'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { InvoiceRepository } from '../../../../_libs/database/repository/invoice/invoice.repository'
import { VisitRepository } from '../../../../_libs/database/repository/visit/visit.repository'
import {
  CustomerPaymentGetManyQuery,
  CustomerPaymentPaginationQuery,
  CustomerPaymentPayDebtBody,
} from './request'

@Injectable()
export class ApiCustomerPaymentService {
  constructor(
    private readonly customerPaymentRepository: CustomerPaymentRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly visitRepository: VisitRepository
  ) {}

  async pagination(oid: number, query: CustomerPaymentPaginationQuery): Promise<BaseResponse> {
    const { page, limit, relation, filter, sort } = query
    const { data, total } = await this.customerPaymentRepository.pagination({
      relation: { customer: relation?.customer },
      page,
      limit,
      condition: {
        oid,
        customerId: filter?.customerId,
        voucherId: filter?.voucherId,
        voucherType: filter?.voucherType,
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
      relation: { customer: relation?.customer },
      condition: {
        oid,
        customerId: filter?.customerId,
        voucherId: filter?.voucherId,
        voucherType: filter?.voucherType,
        paymentType: filter?.paymentType,
      },
      limit,
      sort,
    })
    return { data }
  }

  async voucherDebtList(oid: number, customerId: number): Promise<BaseResponse> {
    const [invoiceBasicList, visitBasicList] = await Promise.all([
      this.invoiceRepository.findMany({
        condition: { oid, customerId, status: InvoiceStatus.Debt },
        sort: { id: 'ASC' },
      }),
      this.visitRepository.findMany({
        condition: { oid, customerId, visitStatus: VisitStatus.Debt },
        sort: { id: 'ASC' },
      }),
    ])
    return { data: { invoiceBasicList, visitBasicList } }
  }

  async startPayDebt(oid: number, body: CustomerPaymentPayDebtBody): Promise<BaseResponse> {
    try {
      const { customer } = await this.customerPaymentRepository.startPayDebt({
        oid,
        customerId: body.customerId,
        time: Date.now(),
        invoicePaymentList: body.invoicePaymentList,
        visitPaymentList: body.visitPaymentList,
        note: body.note,
      })
      return { data: { customer } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
