import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { formatNumber } from '_libs/common/helpers/string.helper'
import { InvoiceStatus, PaymentType } from '_libs/database/common/variable'
import { Customer, CustomerPayment, Invoice } from '_libs/database/entities'
import { DataSource, FindOptionsWhere, In, MoreThanOrEqual, Repository } from 'typeorm'
import { CustomerPaymentCondition, CustomerPaymentOrder } from './customer-payment.dto'

@Injectable()
export class CustomerPaymentRepository {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(CustomerPayment)
        private readonly customerPaymentRepository: Repository<CustomerPayment>
    ) {}

    getWhereOptions(condition: CustomerPaymentCondition = {}) {
        const where: FindOptionsWhere<CustomerPayment> = {}
        if (condition.id != null) where.id = condition.id
        if (condition.oid != null) where.oid = condition.oid
        if (condition.customerId != null) where.customerId = condition.customerId

        if (condition.ids) {
            if (condition.ids.length === 0) condition.ids.push(0)
            where.id = In(condition.ids)
        }

        return where
    }

    async pagination(options: {
        page: number
        limit: number
        condition: CustomerPaymentCondition
        order: CustomerPaymentOrder
    }) {
        const { limit, page, condition, order } = options

        const [data, total] = await this.customerPaymentRepository.findAndCount({
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        })

        return { total, page, limit, data }
    }

    async findMany(condition: CustomerPaymentCondition): Promise<CustomerPayment[]> {
        const where = this.getWhereOptions(condition)
        return await this.customerPaymentRepository.find({ where })
    }

    async findOne(condition: CustomerPaymentCondition): Promise<CustomerPayment> {
        const where = this.getWhereOptions(condition)
        return await this.customerPaymentRepository.findOne({ where })
    }

    async startPayDebt(options: {
        oid: number
        customerId: number
        time: number
        invoicePayments?: { invoiceId: number; money: number }[]
        note?: string
    }) {
        const { oid, customerId, invoicePayments, time, note } = options
        if (!invoicePayments.length || invoicePayments.some((item) => (item.money || 0) <= 0)) {
            throw new Error(`Customer ${customerId} pay debt failed: Money number invalid`)
        }

        const invoiceIds = invoicePayments.map((i) => i.invoiceId)
        const totalMoney = invoicePayments.reduce((acc, cur) => acc + cur.money, 0)

        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            // Update customer trước để lock
            const updateCustomerResult = await manager.decrement<Customer>(
                Customer,
                {
                    id: customerId,
                    oid,
                    debt: MoreThanOrEqual(totalMoney),
                },
                'debt',
                totalMoney
            )
            if (updateCustomerResult.affected !== 1) {
                throw new Error(`Customer ${customerId} pay debt failed: Update customer invalid`)
            }

            const customer = await manager.findOne(Customer, { where: { oid, id: customerId } })
            let customerOpenDebt = customer.debt + totalMoney
            const customerPaymentListDto: CustomerPayment[] = []

            for (let i = 0; i < invoiceIds.length; i++) {
                const invoiceId = invoiceIds[i] || 0
                const money = invoicePayments.find((item) => item.invoiceId === invoiceId)?.money

                // Trả nợ vào từng đơn
                const invoiceUpdateResult = await manager
                    .createQueryBuilder()
                    .update(Invoice)
                    .set({
                        status: () => `IF(debt = ${money}, ${InvoiceStatus.Success}, ${InvoiceStatus.Debt})`,
                        debt: () => `debt - ${money}`,
                        paid: () => `paid + ${money}`,
                    })
                    .where({
                        id: invoiceId,
                        oid,
                        status: InvoiceStatus.Debt,
                        debt: MoreThanOrEqual(money),
                    })
                    .execute()
                if (invoiceUpdateResult.affected !== 1) {
                    throw new Error(`Customer ${customerId} pay debt failed: Update Invoice ${invoiceId} failed`)
                }
                const invoice = await manager.findOne(Invoice, { where: { oid, id: invoiceId } })
                const invoiceOpenDebt = invoice.debt + money

                const customerPaymentDto = manager.create(CustomerPayment, {
                    oid,
                    customerId,
                    invoiceId,
                    time,
                    type: PaymentType.PayDebt,
                    paid: money,
                    debit: -money,
                    customerOpenDebt,
                    customerCloseDebt: customerOpenDebt - money,
                    invoiceOpenDebt,
                    invoiceCloseDebt: invoiceOpenDebt - money,
                    note,
                    description:
                        invoicePayments.length > 1
                            ? `Trả ${formatNumber(totalMoney)} vào ${invoicePayments.length} đơn nợ: ${JSON.stringify(
                                invoiceIds
                            )}`
                            : undefined,
                })
                customerOpenDebt = customerOpenDebt - money
                customerPaymentListDto.push(customerPaymentDto)
            }

            await this.customerPaymentRepository.insert(customerPaymentListDto)

            return { customerId }
        })
    }
}
