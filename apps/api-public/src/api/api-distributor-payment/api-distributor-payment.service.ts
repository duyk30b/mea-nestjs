import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { DistributorPaymentRepository } from '../../../../_libs/database/repositories/distributor-payment.repository'
import { DistributorRepository } from '../../../../_libs/database/repositories/distributor.repository'
import { DistributorPaymentPaginationQuery, DistributorPaymentPayDebtBody } from './request'

@Injectable()
export class ApiDistributorPaymentService {
  constructor(
    private readonly distributorPaymentRepository: DistributorPaymentRepository,
    private readonly distributorRepository: DistributorRepository
  ) { }

  async pagination(oid: number, query: DistributorPaymentPaginationQuery): Promise<BaseResponse> {
    const { page, limit, relation, filter, sort } = query
    const { data, total } = await this.distributorPaymentRepository.pagination({
      relationLoadStrategy: 'query',
      relation: {
        distributor: relation?.distributor,
        paymentMethod: relation?.paymentMethod,
      },
      page,
      limit,
      condition: {
        oid,
        distributorId: filter?.distributorId,
      },
      sort,
    })

    return {
      data,
      meta: { total, page, limit },
    }
  }

  async startPayDebt(oid: number, body: DistributorPaymentPayDebtBody): Promise<BaseResponse> {
    try {
      const { distributorId } = await this.distributorPaymentRepository.startPayDebt({
        oid,
        distributorId: body.distributorId,
        paymentMethodId: body.paymentMethodId,
        time: Date.now(),
        receiptPaymentList: body.receiptPaymentList,
        note: body.note,
      })
      const distributor = await this.distributorRepository.findOneBy({ id: distributorId })
      return { data: { distributor } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
