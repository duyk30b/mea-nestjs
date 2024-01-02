import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CustomerPaymentRepository, CustomerRepository } from '../../../../_libs/database/repository'
import { CustomerPaymentPaginationQuery, CustomerPaymentPayDebtBody } from './request'

@Injectable()
export class ApiCustomerPaymentService {
    constructor(
        private readonly customerPaymentRepository: CustomerPaymentRepository,
        private readonly customerRepository: CustomerRepository
    ) {}

    async pagination(oid: number, query: CustomerPaymentPaginationQuery) {
        return await this.customerPaymentRepository.pagination({
            page: query.page,
            limit: query.limit,
            condition: {
                oid,
                customerId: query.filter?.customerId,
            },
            order: query.sort || { id: 'DESC' },
        })
    }

    async startPayDebt(oid: number, body: CustomerPaymentPayDebtBody) {
        try {
            const { customerId } = await this.customerPaymentRepository.startPayDebt({
                oid,
                customerId: body.customerId,
                time: Date.now(),
                invoicePayments: body.invoicePayments,
                note: body.note,
            })
            const customer = await this.customerRepository.findOneBy({ id: customerId })
            return { customer }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }
}
