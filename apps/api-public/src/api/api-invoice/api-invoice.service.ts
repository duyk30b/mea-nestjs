import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import {
    InvoiceDraftInsertDto,
    InvoiceDraftUpdateDto,
    InvoiceProcessRepository,
    InvoiceRepository,
    ProductBatchRepository,
    ProductRepository,
} from '../../../../_libs/database/repository'
import {
    InvoiceDraftCreateBody,
    InvoiceDraftUpdateBody,
    InvoiceGetManyQuery,
    InvoiceGetOneQuery,
    InvoicePaginationQuery,
    InvoiceSumDebtQuery,
} from './request'

@Injectable()
export class ApiInvoiceService {
    constructor(
        private readonly invoiceRepository: InvoiceRepository,
        private readonly invoiceProcessRepository: InvoiceProcessRepository,
        private readonly productRepository: ProductRepository,
        private readonly productBatchRepository: ProductBatchRepository
    ) {}

    async pagination(oid: number, query: InvoicePaginationQuery) {
        const { time, deleteTime, customerId, status } = query.filter || {}

        return await this.invoiceRepository.pagination({
            page: query.page,
            limit: query.limit,
            condition: {
                oid,
                customerId,
                status,
                time,
                deleteTime,
            },
            relation: { customer: query.relation?.customer },
            sort: query.sort || { id: 'DESC' },
        })
    }

    async getMany(oid: number, query: InvoiceGetManyQuery) {
        const { relation, limit } = query
        const { time, deleteTime, customerId, status } = query.filter || {}

        return await this.invoiceRepository.findMany({
            condition: {
                oid,
                customerId,
                status,
                time,
                deleteTime,
            },
            relation: { customer: relation?.customer },
            limit,
        })
    }

    async getOne(oid: number, id: number, { relation }: InvoiceGetOneQuery) {
        return await this.invoiceRepository.queryOne(
            { oid, id },
            {
                customer: !!relation?.customer,
                customerPayments: !!relation?.customerPayments,
                invoiceExpenses: !!relation?.invoiceExpenses,
                invoiceSurcharges: !!relation?.invoiceSurcharges,
                invoiceItems: relation?.invoiceItems && {
                    procedure: true,
                    productBatch: { product: true },
                },
            }
        )
    }

    async createBasic(params: { oid: number; body: InvoiceDraftCreateBody }) {
        const { oid, body } = params
        try {
            const { invoiceId } = await this.invoiceProcessRepository.createDraft({
                oid,
                invoiceInsertDto: InvoiceDraftInsertDto.from(body),
            })
            const { productIds } = await this.invoiceProcessRepository.startShipAndPayment({
                oid,
                invoiceId,
                time: Date.now(),
                money: body.revenue,
            })

            const products = await this.productRepository.findManyBy({ id: { IN: productIds }, isActive: 1 })
            const productBatches = await this.productBatchRepository.findManyBy({
                productId: { IN: productIds },
                isActive: 1,
            })
            products.forEach((item) => {
                item.productBatches = productBatches
                    .filter((ma) => ma.productId === item.id)
                    .sort((a, b) => ((a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1))
            })

            return { invoiceId, products }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async updateBasic(params: { oid: number; oldInvoiceId: number; time: number; body: InvoiceDraftUpdateBody }) {
        const { oid, body, oldInvoiceId, time } = params
        try {
            await this.invoiceProcessRepository.startRefund({ oid, invoiceId: oldInvoiceId, time })
            await this.invoiceProcessRepository.softDeleteRefund({ oid, invoiceId: oldInvoiceId })

            const { invoiceId } = await this.invoiceProcessRepository.createDraft({
                oid,
                invoiceInsertDto: InvoiceDraftInsertDto.from(body),
            })
            const { productIds } = await this.invoiceProcessRepository.startShipAndPayment({
                oid,
                invoiceId,
                time: Date.now(),
                money: body.revenue,
            })

            return { invoiceId, productIds }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async createDraft(params: { oid: number; body: InvoiceDraftCreateBody }) {
        const { oid, body } = params
        try {
            const { invoiceId } = await this.invoiceProcessRepository.createDraft({
                oid,
                invoiceInsertDto: InvoiceDraftInsertDto.from(body),
            })
            return { invoiceId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async updateDraft(params: { oid: number; invoiceId: number; body: InvoiceDraftUpdateBody }) {
        const { oid, invoiceId, body } = params
        try {
            await this.invoiceProcessRepository.updateDraft({
                oid,
                invoiceId,
                invoiceUpdateDto: InvoiceDraftUpdateDto.from(body),
            })
            return { invoiceId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async destroyDraft(params: { oid: number; invoiceId: number }) {
        const { oid, invoiceId } = params
        try {
            await this.invoiceProcessRepository.destroyDraft({ oid, invoiceId })
            return { invoiceId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async prepayment(params: { oid: number; invoiceId: number; money: number }) {
        const { oid, invoiceId, money } = params
        try {
            await this.invoiceProcessRepository.prepayment({
                oid,
                invoiceId,
                time: Date.now(),
                money,
            })
            return { invoiceId }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async startShipAndPayment(params: { oid: number; invoiceId: number; time: number; money: number }) {
        const { oid, invoiceId, time, money } = params
        try {
            await this.invoiceProcessRepository.startShipAndPayment({ oid, invoiceId, time, money })
            return { invoiceId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async payDebt(params: { oid: number; invoiceId: number; time: number; money: number }) {
        const { oid, invoiceId, time, money } = params
        try {
            await this.invoiceProcessRepository.payDebt({ oid, invoiceId, time, money })
            return { invoiceId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async startRefund(params: { oid: number; invoiceId: number; time: number }) {
        const { oid, invoiceId, time } = params
        try {
            await this.invoiceProcessRepository.startRefund({ oid, invoiceId, time })
            return { invoiceId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async softDeleteRefund(params: { oid: number; invoiceId: number }) {
        const { oid, invoiceId } = params
        try {
            await this.invoiceProcessRepository.softDeleteRefund({ oid, invoiceId })
            return { invoiceId }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async sumDebt(oid: number, { filter }: InvoiceSumDebtQuery) {
        const result = await this.invoiceRepository.sumDebt({
            oid,
            time: filter?.time,
        })
        return { invoiceSumDebt: result }
    }
}
