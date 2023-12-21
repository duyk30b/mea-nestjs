import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager, In, IsNull, Raw } from 'typeorm'
import { uniqueArray } from '../../../common/helpers/object.helper'
import { DTimer } from '../../../common/helpers/time.helper'
import { PaymentType, ReceiptStatus } from '../../common/variable'
import { Distributor, DistributorPayment, ProductBatch, ProductMovement, Receipt, ReceiptItem } from '../../entities'
import { ProductMovementType } from '../../entities/product-movement.entity'
import { ProductRepository } from '../product/product.repository'
import { ReceiptInsertDto, ReceiptUpdateDto } from './receipt.dto'

@Injectable()
export class ReceiptProcessRepository {
    constructor(
        private dataSource: DataSource,
        @InjectEntityManager() private manager: EntityManager,
        private productRepository: ProductRepository
    ) {}

    async createDraft(params: { oid: number; receiptInsertDto: ReceiptInsertDto }) {
        const { oid, receiptInsertDto } = params
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const receiptSnap = manager.create<Receipt>(Receipt, receiptInsertDto)
            receiptSnap.oid = oid
            receiptSnap.status = ReceiptStatus.Draft
            receiptSnap.paid = 0
            receiptSnap.debt = 0

            const receiptResult = await manager.insert(Receipt, receiptSnap)
            const receiptId = receiptResult.identifiers?.[0]?.id
            if (!receiptId) {
                throw new Error(`Create Receipt failed: Insert error ${JSON.stringify(receiptResult)}`)
            }

            const receiptItemsEntity = manager.create<ReceiptItem>(ReceiptItem, receiptInsertDto.receiptItems)
            receiptItemsEntity.forEach((item) => {
                item.oid = oid
                item.receiptId = receiptId
                item.distributorId = receiptInsertDto.distributorId
            })
            await manager.insert(ReceiptItem, receiptItemsEntity)

            return { receiptId }
        })
    }

    async updateDraft(params: { oid: number; receiptId: number; receiptUpdateDto: ReceiptUpdateDto }) {
        const { oid, receiptId, receiptUpdateDto } = params

        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const { receiptItems, ...receiptSnap } = manager.create<Receipt>(Receipt, receiptUpdateDto)
            receiptSnap.paid = 0
            receiptSnap.debt = 0
            const receiptUpdateResult = await manager.update(
                Receipt,
                {
                    id: receiptId,
                    oid,
                    status: ReceiptStatus.Draft,
                },
                receiptSnap
            )
            if (receiptUpdateResult.affected !== 1) {
                throw new Error(`Update Receipt ${receiptId} failed: Status invalid`)
            }

            const receipt = await manager.findOneBy(Receipt, { id: receiptId, oid })

            await manager.delete(ReceiptItem, { oid, receiptId })
            const receiptItemsEntity = manager.create<ReceiptItem>(ReceiptItem, receiptUpdateDto.receiptItems)
            receiptItemsEntity.forEach((item) => {
                item.oid = oid
                item.receiptId = receiptId
                item.distributorId = receipt.distributorId
            })
            await manager.insert(ReceiptItem, receiptItemsEntity)

            return { receiptId }
        })
    }

    async destroyDraft(params: { oid: number; receiptId: number }) {
        const { oid, receiptId } = params
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const receiptDeleteResult = await manager.delete(Receipt, {
                oid,
                id: receiptId,
                status: ReceiptStatus.Draft,
            })
            if (receiptDeleteResult.affected !== 1) {
                throw new Error(`Delete Receipt ${receiptId} failed: Status invalid`)
            }
            await manager.delete(ReceiptItem, { oid, receiptId })
        })
    }

    async prepayment(params: { oid: number; receiptId: number; time: number; money: number }) {
        const { oid, receiptId, time, money } = params
        if (money < 0) {
            throw new Error(`Prepayment Receipt ${receiptId} failed: Money number invalid`)
        }

        const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const receiptUpdateResult = await manager.getRepository(Receipt).update(
                {
                    id: receiptId,
                    oid,
                    status: In([ReceiptStatus.Draft, ReceiptStatus.AwaitingShipment]),
                    revenue: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
                },
                {
                    status: ReceiptStatus.AwaitingShipment,
                    paid: () => `paid + ${money}`,
                    debt: 0, // thanh toán trước nên không tính là nợ
                }
            )
            if (receiptUpdateResult.affected !== 1) {
                throw new Error(`Prepayment Receipt ${receiptId} failed`)
            }

            const receipt = await manager.findOne(Receipt, { where: { oid, id: receiptId } })

            // Lưu lịch sử trả tiền
            if (money > 0) {
                const distributor = await manager.findOneBy(Distributor, {
                    oid,
                    id: receipt.distributorId,
                })
                const distributorCloseDebt = distributor.debt
                const distributorOpenDebt = distributor.debt
                const distributorPaymentInsertResult = await manager.insert(DistributorPayment, {
                    oid,
                    distributorId: receipt.distributorId,
                    receiptId,
                    time,
                    type: PaymentType.Prepayment,
                    paid: money,
                    debit: 0, // prepayment không phát sinh nợ
                    distributorOpenDebt,
                    distributorCloseDebt,
                    receiptOpenDebt: 0,
                    receiptCloseDebt: 0,
                })
                const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
                if (!distributorPaymentId) {
                    throw new Error(
                        `Create DistributorPayment failed: Insert error ${JSON.stringify(
                            distributorPaymentInsertResult
                        )}`
                    )
                }
            }
        })
    }

    async startShipAndPayment(params: { oid: number; receiptId: number; time: number; money: number }) {
        const { oid, receiptId, time, money } = params
        if (money < 0) {
            throw new Error(`Ship and Payment Receipt ${receiptId} failed: Money number invalid`)
        }
        const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            // Lưu receipt trước để tạo lock
            const receiptUpdateResult = await manager.getRepository(Receipt).update(
                {
                    id: receiptId,
                    oid,
                    status: In([ReceiptStatus.Draft, ReceiptStatus.AwaitingShipment]),
                    revenue: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
                },
                {
                    status: () => `CASE 
                            WHEN(revenue - paid = ${money}) THEN ${ReceiptStatus.Success} 
                            ELSE ${ReceiptStatus.Debt}
                            END
                        `,
                    debt: () => `revenue - paid - ${money}`,
                    paid: () => `paid + ${money}`,
                    time,
                    shipTime: new Date(time),
                    shipYear: DTimer.info(time, 7).year,
                    shipMonth: DTimer.info(time, 7).month + 1,
                    shipDate: DTimer.info(time, 7).date,
                }
            )
            if (receiptUpdateResult.affected !== 1) {
                throw new Error(`Payment Receipt ${receiptId} failed: Update failed`)
            }

            const [receipt] = await manager.find(Receipt, {
                relations: { receiptItems: true },
                relationLoadStrategy: 'join',
                where: { oid, id: receiptId },
            })
            if (receipt.receiptItems.length === 0) {
                throw new Error(`Process Receipt ${receiptId} failed: receiptItems.length = 0`)
            }

            // Có nợ => thêm nợ vào NCC
            if (receipt.debt) {
                const updateDistributorResult = await manager.increment<Distributor>(
                    Distributor,
                    { id: receipt.distributorId },
                    'debt',
                    receipt.debt
                )
                if (updateDistributorResult.affected !== 1) {
                    throw new Error(
                        `Payment Receipt ${receiptId} failed: Update distributor ${receipt.distributorId} invalid`
                    )
                }
            }

            const distributor = await manager.findOneBy(Distributor, {
                oid,
                id: receipt.distributorId,
            })
            const distributorCloseDebt = distributor.debt
            const distributorOpenDebt = distributorCloseDebt - receipt.debt
            const receiptCloseDebt = receipt.debt
            const receiptOpenDebt = receiptCloseDebt + money

            // Lưu lịch sử trả tiền vào distributorPayment
            const distributorPaymentInsertResult = await manager.insert(DistributorPayment, {
                oid,
                distributorId: receipt.distributorId,
                receiptId,
                time,
                type: PaymentType.ImmediatePayment,
                paid: money,
                debit: receipt.debt,
                distributorOpenDebt,
                distributorCloseDebt,
                receiptOpenDebt,
                receiptCloseDebt,
            })
            const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
            if (!distributorPaymentId) {
                throw new Error(
                    `Create DistributorPayment failed: Insert error ${JSON.stringify(distributorPaymentInsertResult)}`
                )
            }

            // Cộng số lượng vào lô hàng
            const productBatchIds = uniqueArray(receipt.receiptItems.map((i) => i.productBatchId))
            let productIds: number[] = []

            if (receipt.receiptItems.length) {
                // update trước để lock các bản ghi của productBatch
                const updateBatch: [any[], number] = await manager.query(`
                    UPDATE  "ProductBatch" "productBatch" 
                    SET     "quantity" = "quantity" + "sri"."sumQuantity"
                    FROM    ( 
                            SELECT "productBatchId", SUM("quantity") as "sumQuantity" 
                                FROM "ReceiptItem" "receiptItem"
                                WHERE "receiptItem"."receiptId" = ${receipt.id} AND "receiptItem"."oid" = ${oid}
                                GROUP BY "productBatchId"
                            ) AS sri 
                    WHERE   "productBatch"."id" = "sri"."productBatchId"
                                AND "productBatch"."id" IN (${productBatchIds.toString()})
                                AND "productBatch"."oid" = ${oid}
                `)

                if (updateBatch[1] !== productBatchIds.length) {
                    throw new Error(`Process Receipt ${receiptId} failed: Some batch can't update quantity`)
                }

                const productBatches = await manager.findBy(ProductBatch, {
                    id: In(productBatchIds),
                })
                productIds = uniqueArray(productBatches.map((i) => i.productId))

                const productMovementsEntity = receipt.receiptItems.map((receiptItem) => {
                    const productBatch = productBatches.find((i) => i.id === receiptItem.productBatchId)
                    if (!productBatch) {
                        throw new Error(
                            `Process Receipt ${receiptId} failed: ProductBatchID ${receiptItem.productBatchId} invalid`
                        )
                    }
                    // cần phải cập nhật số lượng vì có thể nhiều sản phẩm cùng update số lượng
                    productBatch.quantity = productBatch.quantity - receiptItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước

                    return manager.create(ProductMovement, {
                        oid,
                        productId: productBatch.productId,
                        productBatchId: productBatch.id,
                        referenceId: receiptId,
                        createTime: time,
                        type: ProductMovementType.Receipt,
                        isRefund: 0,
                        openQuantity: productBatch.quantity,
                        number: receiptItem.quantity,
                        unit: receiptItem.unit,
                        closeQuantity: productBatch.quantity + receiptItem.quantity,
                        price: productBatch.costPrice,
                        totalMoney: receiptItem.quantity * productBatch.costPrice,
                    })
                })
                await manager.insert(ProductMovement, productMovementsEntity.reverse())
            }
            return { productIds, receiptId }
        })
        const { productIds } = transaction

        if (productIds.length) {
            await this.productRepository.calculateProductQuantity({
                oid,
                productIds,
            })
        }

        return { productIds, receiptId }
    }

    async payDebt(params: { oid: number; receiptId: number; time: number; money: number }) {
        const { oid, receiptId, time, money } = params
        if (money <= 0) {
            throw new Error(`Pay Debt Receipt ${receiptId} failed: Money number invalid`)
        }

        const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const receiptUpdateResult = await manager.getRepository(Receipt).update(
                {
                    id: receiptId,
                    oid,
                    status: ReceiptStatus.Debt,
                    revenue: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
                },
                {
                    status: () => `CASE 
                            WHEN(revenue - paid = ${money}) THEN ${ReceiptStatus.Success} 
                            ELSE ${ReceiptStatus.Debt}
                            END
                        `,
                    debt: () => `debt - ${money}`,
                    paid: () => `paid + ${money}`,
                }
            )
            if (receiptUpdateResult.affected !== 1) {
                throw new Error(`Payment Receipt ${receiptId} failed: Update failed`)
            }

            const [receipt] = await manager.find(Receipt, {
                relations: { receiptItems: true },
                relationLoadStrategy: 'join',
                where: { oid, id: receiptId },
            })

            // Trừ nợ khách hàng
            const updateDistributor = await manager.decrement<Distributor>(
                Distributor,
                { id: receipt.distributorId },
                'debt',
                money
            )
            if (updateDistributor.affected !== 1) {
                throw new Error(
                    `Refund Receipt ${receiptId} failed: Update distributor ${receipt.distributorId} invalid`
                )
            }
            const distributor = await manager.findOneBy(Distributor, {
                oid,
                id: receipt.distributorId,
            })

            const distributorCloseDebt = distributor.debt
            const distributorOpenDebt = distributorCloseDebt + money
            const receiptCloseDebt = receipt.debt
            const receiptOpenDebt = receiptCloseDebt + money

            // Lưu lịch sử trả tiền
            const distributorPaymentInsertResult = await manager.insert(DistributorPayment, {
                oid,
                distributorId: receipt.distributorId,
                receiptId,
                time,
                type: PaymentType.PayDebt,
                paid: money,
                debit: -money,
                distributorOpenDebt,
                distributorCloseDebt,
                receiptOpenDebt,
                receiptCloseDebt,
            })

            const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
            if (!distributorPaymentId) {
                throw new Error(
                    `Create DistributorPayment failed: Insert error ${JSON.stringify(distributorPaymentInsertResult)}`
                )
            }
        })
    }

    async startRefund(params: { oid: number; receiptId: number; time: number }) {
        const { oid, receiptId, time } = params
        const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
            const [receipt] = await manager.find(Receipt, {
                relations: { receiptItems: true },
                relationLoadStrategy: 'join',
                where: {
                    oid,
                    id: receiptId,
                    status: In([ReceiptStatus.AwaitingShipment, ReceiptStatus.Debt, ReceiptStatus.Success]),
                },
            })
            if (!receipt || receipt.receiptItems.length === 0) {
                throw new Error(`Refund Receipt ${receiptId} failed: receiptItems.length = 0 `)
            }

            const receiptUpdateResult = await manager.update(
                Receipt,
                {
                    id: receiptId,
                    oid,
                    status: In([ReceiptStatus.AwaitingShipment, ReceiptStatus.Debt, ReceiptStatus.Success]),
                },
                {
                    status: ReceiptStatus.Refund,
                    debt: 0,
                    paid: 0,
                }
            )
            if (receiptUpdateResult.affected !== 1) {
                throw new Error(`Refund Receipt ${receiptId} failed: Receipt ${receiptId} invalid`)
            }

            // Hoàn trả nợ vào NCC nếu có

            if (receipt.debt !== 0) {
                const updateDistributor = await manager.decrement<Distributor>(
                    Distributor,
                    { id: receipt.distributorId },
                    'debt',
                    receipt.debt
                )
                if (updateDistributor.affected !== 1) {
                    throw new Error(
                        `Refund Receipt ${receiptId} failed: Update distributor ${receipt.distributorId} invalid`
                    )
                }
            }

            const distributor = await manager.findOneBy(Distributor, {
                oid,
                id: receipt.distributorId,
            })
            const distributorCloseDebt = distributor.debt
            const distributorOpenDebt = distributorCloseDebt + receipt.debt
            const receiptOpenDebt = receipt.debt

            // Lưu lịch sử nhận hoàn trả tiền
            const distributorPaymentInsertResult = await manager.insert(DistributorPayment, {
                oid,
                distributorId: receipt.distributorId,
                receiptId,
                time,
                type: PaymentType.ReceiveRefund,
                paid: -receipt.paid,
                debit: -receipt.debt,
                distributorOpenDebt,
                distributorCloseDebt,
                receiptOpenDebt,
                receiptCloseDebt: 0,
            })

            const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
            if (!distributorPaymentId) {
                throw new Error(
                    `Create DistributorPayment failed: Insert error ${JSON.stringify(distributorPaymentInsertResult)}`
                )
            }

            // Trừ số lượng vào lô hàng
            let productIds: number[] = []
            const productBatchIds = uniqueArray(receipt.receiptItems.map((i) => i.productBatchId))

            if (receipt.receiptItems.length) {
                // update trước để lock các bản ghi của productBatch
                const updateBatch: [any[], number] = await manager.query(`
                    UPDATE  "ProductBatch" "productBatch" 
                    SET     "quantity" = "quantity" - "sri"."sumQuantity"
                    FROM    ( 
                            SELECT "productBatchId", SUM("quantity") as "sumQuantity" 
                                FROM "ReceiptItem" "receiptItem"
                                WHERE "receiptItem"."receiptId" = ${receipt.id} AND "receiptItem"."oid" = ${oid}
                                GROUP BY "productBatchId"
                            ) AS sri 
                    WHERE   "productBatch"."id" = "sri"."productBatchId"
                                AND "productBatch"."id" IN (${productBatchIds.toString()})
                                AND "productBatch"."oid" = ${oid}
                `)
                if (updateBatch[1] !== productBatchIds.length) {
                    throw new Error(`Refund Receipt ${receiptId} failed: Some batch can't update quantity`)
                }

                const productBatches = await manager.findBy(ProductBatch, {
                    id: In(productBatchIds),
                })
                productIds = uniqueArray(productBatches.map((i) => i.productId))

                const productMovementsEntity = receipt.receiptItems.map((receiptItem) => {
                    const productBatch = productBatches.find((i) => i.id === receiptItem.productBatchId)
                    if (!productBatch) {
                        throw new Error(
                            `Refund Receipt ${receiptId} failed: ProductBatchID ${receiptItem.productBatchId} invalid`
                        )
                    }
                    // cần phải cập nhật số lượng vì có thể nhiều sản phẩm cùng update số lượng
                    productBatch.quantity = productBatch.quantity + receiptItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước

                    return manager.create(ProductMovement, {
                        oid,
                        productId: productBatch.productId,
                        productBatchId: productBatch.id,
                        referenceId: receiptId,
                        type: ProductMovementType.Receipt,
                        createTime: time,
                        isRefund: 1,
                        openQuantity: productBatch.quantity,
                        number: -receiptItem.quantity,
                        unit: receiptItem.unit,
                        closeQuantity: productBatch.quantity - receiptItem.quantity,
                        price: productBatch.costPrice,
                        totalMoney: -receiptItem.quantity * productBatch.costPrice,
                    })
                })
                await manager.insert(ProductMovement, productMovementsEntity.reverse())
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

    async softDeleteRefund(params: { oid: number; receiptId: number }) {
        const { oid, receiptId } = params
        const receiptUpdateResult = await this.manager.update(
            Receipt,
            {
                id: receiptId,
                oid,
                status: ReceiptStatus.Refund,
                deleteTime: IsNull(),
            },
            { deleteTime: Date.now() }
        )
        if (receiptUpdateResult.affected !== 1) {
            throw new Error(`Delete Receipt ${receiptId} failed: Status invalid`)
        }
    }
}
