import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { DTimer } from '_libs/common/helpers/time.helper'
import { InvoiceItemType, InvoiceStatus, PaymentType } from '_libs/database/common/variable'
import {
    Customer,
    CustomerPayment,
    Invoice,
    InvoiceExpense,
    InvoiceItem,
    InvoiceSurcharge,
    ProductBatch,
    ProductMovement,
} from '_libs/database/entities'
import { ProductMovementType } from '_libs/database/entities/product-movement.entity'
import { DataSource, EntityManager, In, IsNull, Raw } from 'typeorm'
import { ProductRepository } from '../product/product.repository'
import { InvoiceDraftInsertDto, InvoiceDraftUpdateDto } from './invoice.dto'

@Injectable()
export class InvoiceProcessRepository {
    constructor(
        private dataSource: DataSource,
        @InjectEntityManager() private manager: EntityManager,
        private productRepository: ProductRepository
    ) {}

    async createDraft(params: { oid: number; invoiceInsertDto: InvoiceDraftInsertDto }) {
        const { oid, invoiceInsertDto } = params

        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const { invoiceItems, ...invoiceSnap } = manager.create<Invoice>(Invoice, invoiceInsertDto)
            invoiceSnap.oid = oid
            invoiceSnap.status = InvoiceStatus.Draft
            invoiceSnap.paid = 0
            invoiceSnap.debt = 0

            const invoiceInsertResult = await manager.insert(Invoice, invoiceSnap)
            const invoiceId: number = invoiceInsertResult.identifiers?.[0]?.id
            if (!invoiceId) {
                throw new Error(`Create Invoice failed: Insert error ${JSON.stringify(invoiceInsertResult)}`)
            }

            const invoiceItemsSnap = manager.create<InvoiceItem>(InvoiceItem, invoiceInsertDto.invoiceItems)
            invoiceItemsSnap.forEach((item) => {
                item.oid = oid
                item.invoiceId = invoiceId
                item.customerId = invoiceInsertDto.customerId
            })
            await manager.insert(InvoiceItem, invoiceItemsSnap)

            const invoiceSurchargesSnap = manager.create<InvoiceSurcharge>(
                InvoiceSurcharge,
                invoiceInsertDto.invoiceSurcharges
            )
            invoiceSurchargesSnap.forEach((item) => {
                item.oid = oid
                item.invoiceId = invoiceId
            })
            await manager.insert(InvoiceSurcharge, invoiceSurchargesSnap)

            const invoiceExpensesSnap = manager.create<InvoiceExpense>(InvoiceExpense, invoiceInsertDto.invoiceExpenses)
            invoiceExpensesSnap.forEach((item) => {
                item.oid = oid
                item.invoiceId = invoiceId
            })
            await manager.insert(InvoiceExpense, invoiceExpensesSnap)

            return { invoiceId }
        })
    }

    async updateDraft(params: { oid: number; invoiceId: number; invoiceUpdateDto: InvoiceDraftUpdateDto }) {
        const { oid, invoiceId, invoiceUpdateDto } = params

        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const { invoiceItems, invoiceExpenses, invoiceSurcharges, ...invoiceSnap } = manager.create<Invoice>(
                Invoice,
                invoiceUpdateDto
            )
            invoiceSnap.paid = 0
            invoiceSnap.debt = 0
            const invoiceUpdateResult = await manager.getRepository(Invoice).update(
                {
                    id: invoiceId,
                    oid,
                    status: InvoiceStatus.Draft,
                },
                invoiceSnap
            )
            if (invoiceUpdateResult.affected !== 1) {
                throw new Error(`Update Invoice ${invoiceId} failed: Status invalid`)
            }

            const invoice = await manager.findOneBy(Invoice, { id: invoiceId, oid })

            await manager.delete(InvoiceItem, { oid, invoiceId })
            await manager.delete(InvoiceSurcharge, { oid, invoiceId })
            await manager.delete(InvoiceExpense, { oid, invoiceId })

            const invoiceItemsSnap = manager.create<InvoiceItem>(InvoiceItem, invoiceUpdateDto.invoiceItems)
            invoiceItemsSnap.forEach((item) => {
                item.oid = oid
                item.invoiceId = invoiceId
                item.customerId = invoice.customerId
            })
            await manager.insert(InvoiceItem, invoiceItemsSnap)

            const invoiceSurchargesSnap = manager.create<InvoiceSurcharge>(
                InvoiceSurcharge,
                invoiceUpdateDto.invoiceSurcharges
            )
            invoiceSurchargesSnap.forEach((item) => {
                item.oid = oid
                item.invoiceId = invoiceId
            })
            await manager.insert(InvoiceSurcharge, invoiceSurchargesSnap)

            const invoiceExpensesSnap = manager.create<InvoiceExpense>(InvoiceExpense, invoiceUpdateDto.invoiceExpenses)
            invoiceExpensesSnap.forEach((item) => {
                item.oid = oid
                item.invoiceId = invoiceId
            })
            await manager.insert(InvoiceExpense, invoiceExpensesSnap)

            return { invoiceId }
        })
    }

    async destroyDraft(params: { oid: number; invoiceId: number }) {
        const { oid, invoiceId } = params
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const invoiceDeleteResult = await manager.delete(Invoice, {
                oid,
                id: invoiceId,
                status: InvoiceStatus.Draft,
            })
            if (invoiceDeleteResult.affected !== 1) {
                throw new Error(`Destroy Invoice ${invoiceId} failed: Status invalid`)
            }
            await manager.delete(InvoiceItem, { oid, invoiceId })
            await manager.delete(InvoiceSurcharge, { oid, invoiceId })
            await manager.delete(InvoiceExpense, { oid, invoiceId })
        })
    }

    async prepayment(params: { oid: number; invoiceId: number; time: number; money: number }) {
        const { oid, invoiceId, time, money } = params
        if (money < 0) {
            throw new Error(`Prepayment Invoice ${invoiceId} failed: Money number invalid`)
        }

        const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const invoiceUpdateResult = await manager.getRepository(Invoice).update(
                {
                    id: invoiceId,
                    oid,
                    status: In([InvoiceStatus.Draft, InvoiceStatus.AwaitingShipment]),
                    revenue: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
                },
                {
                    status: InvoiceStatus.AwaitingShipment,
                    paid: () => `paid + ${money}`,
                    debt: 0, // thanh toán trước nên không tính là nợ
                }
            )
            if (invoiceUpdateResult.affected !== 1) {
                throw new Error(`Prepayment Invoice ${invoiceId} failed`)
            }

            const invoice = await manager.findOne(Invoice, { where: { oid, id: invoiceId } })

            // Lưu lịch sử trả tiền
            if (money > 0) {
                const customer = await manager.findOneBy(Customer, {
                    oid,
                    id: invoice.customerId,
                })
                const customerCloseDebt = customer.debt
                const customerOpenDebt = customer.debt
                const customerPaymentInsertResult = await manager.insert(CustomerPayment, {
                    oid,
                    customerId: invoice.customerId,
                    invoiceId,
                    time,
                    type: PaymentType.Prepayment,
                    paid: money,
                    debit: 0, // prepayment không phát sinh nợ
                    customerOpenDebt,
                    customerCloseDebt,
                    invoiceOpenDebt: 0,
                    invoiceCloseDebt: 0,
                })
                const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
                if (!customerPaymentId) {
                    throw new Error(
                        `Create CustomerPayment failed: Insert error ${JSON.stringify(customerPaymentInsertResult)}`
                    )
                }
            }
        })
    }

    async startShipAndPayment(params: { oid: number; invoiceId: number; time: number; money: number }) {
        const { oid, invoiceId, time, money } = params
        if (money < 0) {
            throw new Error(`Ship and Payment Invoice ${invoiceId} failed: Money number invalid`)
        }
        const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            // Lưu invoice trước để tạo lock

            const invoiceUpdateResult = await manager.getRepository(Invoice).update(
                {
                    id: invoiceId,
                    oid,
                    status: In([InvoiceStatus.Draft, InvoiceStatus.AwaitingShipment]),
                    revenue: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
                },
                {
                    status: () => `IF(revenue - paid = ${money}, ${InvoiceStatus.Success}, ${InvoiceStatus.Debt})`,
                    debt: () => `revenue - paid - ${money}`,
                    paid: () => `paid + ${money}`,
                    time,
                    shipTime: new Date(time),
                    shipYear: DTimer.info(time, 7).year,
                    shipMonth: DTimer.info(time, 7).month + 1,
                    shipDate: DTimer.info(time, 7).date,
                }
            )
            if (invoiceUpdateResult.affected !== 1) {
                throw new Error(`Payment Invoice ${invoiceId} failed: Update failed`)
            }

            const [invoice] = await manager.find(Invoice, {
                relations: { invoiceItems: true },
                relationLoadStrategy: 'join',
                where: { oid, id: invoiceId },
            })
            if (invoice.invoiceItems.length === 0) {
                throw new Error(`Process Invoice ${invoiceId} failed: invoiceItems.length = 0`)
            }

            // Có nợ => thêm nợ vào khách hàng
            if (invoice.debt) {
                const updateCustomer = await manager.increment<Customer>(
                    Customer,
                    { id: invoice.customerId, oid },
                    'debt',
                    invoice.debt
                )
                if (updateCustomer.affected !== 1) {
                    throw new Error(
                        `Payment Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`
                    )
                }
            }

            const customer = await manager.findOneBy(Customer, {
                oid,
                id: invoice.customerId,
            })
            const customerCloseDebt = customer.debt
            const customerOpenDebt = customerCloseDebt - invoice.debt
            const invoiceCloseDebt = invoice.debt
            const invoiceOpenDebt = invoiceCloseDebt + money

            // Lưu lịch sử trả tiền vào customerPayment
            const customerPaymentInsertResult = await manager.insert(CustomerPayment, {
                oid,
                customerId: invoice.customerId,
                invoiceId,
                time,
                type: PaymentType.ImmediatePayment,
                paid: money,
                debit: invoice.debt,
                customerOpenDebt,
                customerCloseDebt,
                invoiceOpenDebt,
                invoiceCloseDebt,
            })
            const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
            if (!customerPaymentId) {
                throw new Error(
                    `Create CustomerPayment failed: Insert error ${JSON.stringify(customerPaymentInsertResult)}`
                )
            }

            // Trừ số lượng vào lô hàng
            const invoiceItemsProduct = invoice.invoiceItems.filter((i) => i.type === InvoiceItemType.ProductBatch)
            const invoiceItemIds = invoiceItemsProduct.map((i) => i.id)
            const productBatchIds = uniqueArray(invoiceItemsProduct.map((i: InvoiceItem) => i.referenceId))
            let productIds: number[] = []

            if (invoiceItemsProduct.length) {
                // update trước để lock các bản ghi của productBatch
                const updateBatch = await manager.query(`
                    UPDATE ProductBatch productBatch 
                        LEFT JOIN ( SELECT referenceId, SUM(quantity) as sumQuantity 
                            FROM InvoiceItem invoiceItem
                            WHERE invoiceItem.id IN (${invoiceItemIds.toString()})
                            GROUP BY referenceId
                        ) sii 
                        ON productBatch.id = sii.referenceId
                    SET productBatch.quantity = productBatch.quantity - sii.sumQuantity
                    WHERE productBatch.id IN (${productBatchIds.toString()})
                        AND productBatch.oid = ${oid}
                `)
                if (updateBatch.affectedRows !== productBatchIds.length) {
                    throw new Error(`Process Invoice ${invoiceId} failed: Some batch can't update quantity`)
                }

                const productBatches = await manager.find(ProductBatch, {
                    where: { id: In(productBatchIds) },
                })
                productIds = uniqueArray(productBatches.map((i) => i.productId))

                const productMovementsSnap = invoiceItemsProduct.map((invoiceItem) => {
                    const productBatch = productBatches.find((i) => i.id === invoiceItem.referenceId)
                    if (!productBatch) {
                        throw new Error(
                            `Process Invoice ${invoiceId} failed: ProductBatchID ${invoiceItem.referenceId} invalid`
                        )
                    }
                    // cần cập nhật số lượng vì 1 lô có thể bán 2 số lượng với 2 giá khác nhau
                    productBatch.quantity = productBatch.quantity + invoiceItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước

                    return manager.create(ProductMovement, {
                        oid,
                        productId: productBatch.productId,
                        productBatchId: productBatch.id,
                        referenceId: invoiceId,
                        createTime: time,
                        type: ProductMovementType.Invoice,
                        isRefund: false,
                        openQuantity: productBatch.quantity, // quantity đã được trả đúng số lượng ban đầu ở trên
                        number: -invoiceItem.quantity,
                        closeQuantity: productBatch.quantity - invoiceItem.quantity,
                        price: invoiceItem.actualPrice,
                        totalMoney: invoiceItem.quantity * invoiceItem.actualPrice,
                    })
                })
                await manager.insert(ProductMovement, productMovementsSnap.reverse())
            }

            return { productIds }
        })

        const { productIds } = transaction

        if (productIds.length) {
            await this.productRepository.calculateProductQuantity({
                oid,
                productIds,
            })
        }
    }

    async payDebt(params: { oid: number; invoiceId: number; time: number; money: number }) {
        const { oid, invoiceId, time, money } = params
        if (money <= 0) {
            throw new Error(`Pay Debt Invoice ${invoiceId} failed: Money number invalid`)
        }

        const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const invoiceUpdateResult = await manager.getRepository(Invoice).update(
                {
                    id: invoiceId,
                    oid,
                    status: InvoiceStatus.Debt,
                    revenue: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
                },
                {
                    status: () => `IF(revenue - paid = ${money}, ${InvoiceStatus.Success}, ${InvoiceStatus.Debt})`,
                    debt: () => `debt - ${money}`,
                    paid: () => `paid + ${money}`,
                }
            )
            if (invoiceUpdateResult.affected !== 1) {
                throw new Error(`Payment Invoice ${invoiceId} failed: Update failed`)
            }

            const [invoice] = await manager.find(Invoice, {
                relations: { invoiceItems: true },
                relationLoadStrategy: 'join',
                where: { oid, id: invoiceId },
            })

            // Trừ nợ khách hàng
            const updateCustomer = await manager.decrement<Customer>(
                Customer,
                { id: invoice.customerId },
                'debt',
                money
            )
            if (updateCustomer.affected !== 1) {
                throw new Error(`Refund Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`)
            }
            const customer = await manager.findOneBy(Customer, {
                oid,
                id: invoice.customerId,
            })

            const customerCloseDebt = customer.debt
            const customerOpenDebt = customerCloseDebt + money
            const invoiceCloseDebt = invoice.debt
            const invoiceOpenDebt = invoiceCloseDebt + money

            // Lưu lịch sử trả tiền
            const customerPaymentInsertResult = await manager.insert(CustomerPayment, {
                oid,
                customerId: invoice.customerId,
                invoiceId,
                time,
                type: PaymentType.PayDebt,
                paid: money,
                debit: -money,
                customerOpenDebt,
                customerCloseDebt,
                invoiceOpenDebt,
                invoiceCloseDebt,
            })

            const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
            if (!customerPaymentId) {
                throw new Error(
                    `Create CustomerPayment failed: Insert error ${JSON.stringify(customerPaymentInsertResult)}`
                )
            }
        })
    }

    async startRefund(params: { oid: number; invoiceId: number; time: number }) {
        const { oid, invoiceId, time } = params

        const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
            // Check trạng thái invoice đầu tiên
            const [invoice] = await manager.find(Invoice, {
                relations: { invoiceItems: true },
                relationLoadStrategy: 'join',
                where: {
                    id: invoiceId,
                    oid,
                    status: In([InvoiceStatus.AwaitingShipment, InvoiceStatus.Debt, InvoiceStatus.Success]),
                },
            })
            if (!invoice || invoice.invoiceItems.length === 0) {
                throw new Error(`Refund Invoice ${invoiceId} failed: invoiceItems.length = 0 `)
            }

            const invoiceUpdateResult = await manager.update(
                Invoice,
                {
                    id: invoiceId,
                    oid,
                    status: In([InvoiceStatus.AwaitingShipment, InvoiceStatus.Debt, InvoiceStatus.Success]),
                },
                {
                    status: InvoiceStatus.Refund,
                    paid: 0,
                    debt: 0,
                }
            )
            if (invoiceUpdateResult.affected !== 1) {
                throw new Error(`Refund Invoice ${invoiceId} failed: Invoice ${invoiceId} invalid`)
            }

            // Hoàn trả nợ vào khách hàng nếu có
            if (invoice.debt !== 0) {
                const updateCustomerResult = await manager.decrement<Customer>(
                    Customer,
                    { id: invoice.customerId, oid },
                    'debt',
                    invoice.debt
                )
                if (updateCustomerResult.affected !== 1) {
                    throw new Error(`Refund Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`)
                }
            }

            const customer = await manager.findOneBy(Customer, {
                oid,
                id: invoice.customerId,
            })

            const customerCloseDebt = customer.debt
            const customerOpenDebt = customerCloseDebt + invoice.debt
            const invoiceOpenDebt = invoice.debt

            // Lưu lịch sử nhận hoàn tiền
            const customerPaymentInsertResult = await manager.insert(CustomerPayment, {
                oid,
                customerId: invoice.customerId,
                invoiceId,
                time,
                type: PaymentType.ReceiveRefund,
                paid: -invoice.paid,
                debit: -invoice.debt,
                customerOpenDebt,
                customerCloseDebt,
                invoiceOpenDebt,
                invoiceCloseDebt: 0,
            })

            const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
            if (!customerPaymentId) {
                throw new Error(
                    `Create CustomerPayment failed: Insert error ${JSON.stringify(customerPaymentInsertResult)}`
                )
            }

            // Cộng số lượng vào lô hàng
            const invoiceItemsProduct = invoice.invoiceItems.filter((i) => i.type === InvoiceItemType.ProductBatch)
            const invoiceItemIds = invoiceItemsProduct.map((i) => i.id)
            const productBatchIds = uniqueArray(invoiceItemsProduct.map((i: InvoiceItem) => i.referenceId))
            let productIds: number[] = []

            // nếu đã gửi hàng thì phải trả hàng
            if (invoiceItemsProduct.length) {
                // update trước để lock các bản ghi của productBatch
                const updateBatch = await manager.query(`
                    UPDATE ProductBatch productBatch  
                        LEFT JOIN ( SELECT referenceId, SUM(quantity) as sumQuantity
                            FROM InvoiceItem invoiceItem
                            WHERE invoiceItem.id IN (${invoiceItemIds.toString()})
                            GROUP BY referenceId
                        ) sii 
                        ON productBatch.id = sii.referenceId
                    SET productBatch.quantity = productBatch.quantity + sii.sumQuantity
                    WHERE productBatch.id IN (${productBatchIds.toString()})
                        AND productBatch.oid = ${oid}
                `)
                if (updateBatch.affectedRows !== productBatchIds.length) {
                    throw new Error(`Refund Ship Invoice ${invoiceId} failed: Some batch can't update quantity`)
                }

                const productBatches = await manager.findBy(ProductBatch, {
                    id: In(productBatchIds),
                })
                productIds = uniqueArray(productBatches.map((i) => i.productId))

                const productMovementsSnap = invoiceItemsProduct.map((invoiceItem) => {
                    const productBatch = productBatches.find((i) => i.id === invoiceItem.referenceId)
                    if (!productBatch) {
                        throw new Error(
                            `Refund Invoice ${invoiceId} failed: ProductBatchID ${invoiceItem.referenceId} invalid`
                        )
                    }
                    // cần cập nhật số lượng vì 1 lô có thể bán 2 số lượng với 2 giá khác nhau
                    productBatch.quantity = productBatch.quantity - invoiceItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước

                    return manager.create(ProductMovement, {
                        oid,
                        productId: productBatch.productId,
                        productBatchId: productBatch.id,
                        referenceId: invoiceId,
                        createTime: time,
                        type: ProductMovementType.Invoice,
                        isRefund: true,
                        openQuantity: productBatch.quantity,
                        number: invoiceItem.quantity,
                        closeQuantity: productBatch.quantity + invoiceItem.quantity,
                        price: invoiceItem.actualPrice,
                        totalMoney: -invoiceItem.quantity * invoiceItem.actualPrice,
                    })
                })
                await manager.insert(ProductMovement, productMovementsSnap.reverse())
            }

            return { productIds }
        })

        if (transaction.productIds.length) {
            await this.productRepository.calculateProductQuantity({
                oid,
                productIds: transaction.productIds,
            })
        }
    }

    async softDeleteRefund(params: { oid: number; invoiceId: number }) {
        const { oid, invoiceId } = params
        const invoiceUpdateResult = await this.manager.update(
            Invoice,
            {
                id: invoiceId,
                oid,
                status: InvoiceStatus.Refund,
                deleteTime: IsNull(),
            },
            { deleteTime: Date.now() }
        )
        if (invoiceUpdateResult.affected !== 1) {
            throw new Error(`Delete Invoice ${invoiceId} failed: Status invalid`)
        }
    }
}
