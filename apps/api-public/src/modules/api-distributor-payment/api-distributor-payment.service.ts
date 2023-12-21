import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { DistributorPaymentRepository, DistributorRepository } from '../../../../_libs/database/repository'
import { DistributorPaymentPaginationQuery, DistributorPaymentPayDebtBody } from './request'

@Injectable()
export class ApiDistributorPaymentService {
    constructor(
        private readonly distributorPaymentRepository: DistributorPaymentRepository,
        private readonly distributorRepository: DistributorRepository
    ) {}

    async pagination(oid: number, query: DistributorPaymentPaginationQuery) {
        return await this.distributorPaymentRepository.pagination({
            page: query.page,
            limit: query.limit,
            condition: {
                oid,
                distributorId: query.filter?.distributorId,
            },
            order: query.sort || { id: 'DESC' },
        })
    }

    async startPayDebt(oid: number, body: DistributorPaymentPayDebtBody) {
        try {
            const { distributorId } = await this.distributorPaymentRepository.startPayDebt({
                oid,
                distributorId: body.distributorId,
                time: Date.now(),
                receiptPayments: body.receiptPayments,
                note: body.note,
            })
            const distributor = await this.distributorRepository.findOne({ id: distributorId })
            return { distributor }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }
}
