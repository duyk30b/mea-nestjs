import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import {
    ProductBatchRepository,
    ProductRepository,
    ReceiptInsertDto,
    ReceiptProcessRepository,
    ReceiptRepository,
    ReceiptUpdateDto,
} from '../../../../_libs/database/repository'
import {
    ReceiptDraftCreateBody,
    ReceiptDraftUpdateBody,
    ReceiptGetManyQuery,
    ReceiptGetOneQuery,
    ReceiptPaginationQuery,
} from './request'

@Injectable()
export class ApiReceiptService {
    constructor(
        private readonly receiptRepository: ReceiptRepository,
        private readonly receiptProcessRepository: ReceiptProcessRepository,
        private readonly productRepository: ProductRepository,
        private readonly productBatchRepository: ProductBatchRepository
    ) {}

    async pagination(oid: number, query: ReceiptPaginationQuery) {
        const { time, deleteTime, distributorId } = query.filter || {}

        return await this.receiptRepository.pagination({
            page: query.page,
            limit: query.limit,
            condition: {
                oid,
                distributorId,
                status: query.filter?.status,
                time,
                deleteTime,
            },
            relation: { distributor: query.relation?.distributor },
            sort: query.sort || { id: 'DESC' },
        })
    }

    async getMany(oid: number, query: ReceiptGetManyQuery) {
        const { relation, limit } = query
        const { time, deleteTime, distributorId, status } = query.filter || {}

        return await this.receiptRepository.findMany({
            condition: {
                oid,
                distributorId,
                status,
                time,
                deleteTime,
            },
            limit,
            relation: { distributor: relation?.distributor },
        })
    }

    async getOne(oid: number, id: number, { relation }: ReceiptGetOneQuery) {
        return await this.receiptRepository.findOne({
            condition: { oid, id },
            relation: {
                distributor: !!relation?.distributor,
                distributorPayments: !!relation?.distributorPayments,
                receiptItems: relation?.receiptItems ? { productBatch: { product: true } } : false,
            },
        })
    }

    async queryOne(oid: number, id: number, { relation }: ReceiptGetOneQuery) {
        return await this.receiptRepository.queryOneBy(
            { oid, id },
            {
                distributor: !!relation?.distributor,
                distributorPayments: !!relation?.distributorPayments,
                receiptItems: !!relation?.receiptItems && { productBatch: true },
            }
        )
    }

    async createBasic(params: { oid: number; body: ReceiptDraftCreateBody }) {
        const { oid, body } = params
        try {
            const { receiptId } = await this.receiptProcessRepository.createDraft({
                oid,
                receiptInsertDto: ReceiptInsertDto.from(body),
            })
            await this.receiptProcessRepository.startShipAndPayment({
                oid,
                receiptId,
                time: Date.now(),
                money: body.revenue,
            })

            return { receiptId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async updateBasic(params: { oid: number; oldReceiptId: number; time: number; body: ReceiptDraftCreateBody }) {
        const { oid, body, oldReceiptId, time } = params
        try {
            await this.receiptProcessRepository.startRefund({ oid, receiptId: oldReceiptId, time })
            await this.receiptProcessRepository.softDeleteRefund({ oid, receiptId: oldReceiptId })

            const { receiptId } = await this.receiptProcessRepository.createDraft({
                oid,
                receiptInsertDto: ReceiptInsertDto.from(body),
            })
            await this.receiptProcessRepository.startShipAndPayment({
                oid,
                receiptId,
                time: Date.now(),
                money: body.revenue,
            })

            return { receiptId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async createDraft(params: { oid: number; body: ReceiptDraftCreateBody }) {
        const { oid, body } = params
        try {
            const { receiptId } = await this.receiptProcessRepository.createDraft({
                oid,
                receiptInsertDto: ReceiptInsertDto.from(body),
            })
            return { receiptId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async updateDraft(params: { oid: number; receiptId: number; body: ReceiptDraftUpdateBody }) {
        const { oid, receiptId, body } = params
        try {
            await this.receiptProcessRepository.updateDraft({
                oid,
                receiptId,
                receiptUpdateDto: ReceiptUpdateDto.from(body),
            })
            return { receiptId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async destroyDraft(params: { oid: number; receiptId: number }) {
        const { oid, receiptId } = params
        try {
            await this.receiptProcessRepository.destroyDraft({ oid, receiptId })
            return { receiptId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async prepayment(params: { oid: number; receiptId: number; money: number }) {
        const { oid, receiptId, money } = params
        try {
            await this.receiptProcessRepository.prepayment({
                oid,
                receiptId,
                time: Date.now(),
                money,
            })
            return { receiptId }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async startShipAndPayment(params: { oid: number; receiptId: number; time: number; money: number }) {
        const { oid, receiptId, time, money } = params
        try {
            await this.receiptProcessRepository.startShipAndPayment({ oid, receiptId, time, money })
            return { receiptId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async payDebt(params: { oid: number; receiptId: number; time: number; money: number }) {
        const { oid, receiptId, time, money } = params
        try {
            await this.receiptProcessRepository.payDebt({ oid, receiptId, time, money })
            return { receiptId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async startRefund(params: { oid: number; receiptId: number; time: number }) {
        const { oid, receiptId, time } = params
        try {
            await this.receiptProcessRepository.startRefund({ oid, receiptId, time })
            return { receiptId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async softDeleteRefund(params: { oid: number; receiptId: number }) {
        const { oid, receiptId } = params
        try {
            await this.receiptProcessRepository.softDeleteRefund({ oid, receiptId })
            return { receiptId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }
}
