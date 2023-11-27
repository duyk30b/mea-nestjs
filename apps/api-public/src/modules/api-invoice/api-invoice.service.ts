import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import {
    InvoiceDraftInsertDto,
    InvoiceDraftUpdateDto,
    InvoiceProcessRepository,
    InvoiceRepository,
} from '_libs/database/repository'
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
        private readonly invoiceProcessRepository: InvoiceProcessRepository
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
            order: query.sort || { id: 'DESC' },
        })
    }

    async getMany(oid: number, query: InvoiceGetManyQuery) {
        const { relation, limit } = query
        const { time, deleteTime, customerId, status } = query.filter || {}

        return await this.invoiceRepository.findMany(
            {
                oid,
                customerId,
                status,
                time,
                deleteTime,
            },
            { customer: relation?.customer },
            limit
        )
    }

    async getOne(oid: number, id: number, { relation }: InvoiceGetOneQuery) {
        return await this.invoiceRepository.queryOneBy(
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

    async createDraft(params: { oid: number; body: InvoiceDraftCreateBody }) {
        const { oid, body } = params
        try {
            return await this.invoiceProcessRepository.createDraft({
                oid,
                invoiceInsertDto: InvoiceDraftInsertDto.from(body),
            })
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async updateDraft(params: { oid: number; invoiceId: number; body: InvoiceDraftUpdateBody }) {
        const { oid, invoiceId, body } = params
        try {
            return await this.invoiceProcessRepository.updateDraft({
                oid,
                invoiceId,
                invoiceUpdateDto: InvoiceDraftUpdateDto.from(body),
            })
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async destroyDraft(params: { oid: number; invoiceId: number }) {
        const { oid, invoiceId } = params
        try {
            await this.invoiceProcessRepository.destroyDraft({ oid, invoiceId })
            return { success: true }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async prepayment(params: { oid: number; invoiceId: number; money: number }) {
        const { oid, invoiceId, money } = params
        await this.invoiceProcessRepository.prepayment({
            oid,
            invoiceId,
            time: Date.now(),
            money,
        })
        return { success: true }
    }

    async startShipAndPayment(params: { oid: number; invoiceId: number; time: number; money: number }) {
        const { oid, invoiceId, time, money } = params
        try {
            await this.invoiceProcessRepository.startShipAndPayment({ oid, invoiceId, time, money })
            return { success: true }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async payDebt(params: { oid: number; invoiceId: number; time: number; money: number }) {
        const { oid, invoiceId, time, money } = params
        try {
            await this.invoiceProcessRepository.payDebt({ oid, invoiceId, time, money })
            return { success: true }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async startRefund(params: { oid: number; invoiceId: number; time: number }) {
        const { oid, invoiceId, time } = params
        try {
            await this.invoiceProcessRepository.startRefund({ oid, invoiceId, time })
            return { success: true }
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async softDeleteRefund(params: { oid: number; invoiceId: number }) {
        const { oid, invoiceId } = params
        try {
            await this.invoiceProcessRepository.softDeleteRefund({ oid, invoiceId })
            return { success: true }
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
