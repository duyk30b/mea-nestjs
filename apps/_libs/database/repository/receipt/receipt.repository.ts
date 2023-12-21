import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Between, DataSource, EntityManager, FindOptionsWhere, In, IsNull } from 'typeorm'
import { Receipt } from '../../entities'
import { ReceiptCondition, ReceiptOrder } from './receipt.dto'

@Injectable()
export class ReceiptRepository {
    constructor(
        private dataSource: DataSource,
        @InjectEntityManager() private manager: EntityManager
    ) {}

    getWhereOptions(condition: ReceiptCondition = {}) {
        const where: FindOptionsWhere<Receipt> = {}

        if (condition.id != null) where.id = condition.id
        if (condition.oid != null) where.oid = condition.oid
        if (condition.distributorId != null) where.distributorId = condition.distributorId
        if (condition.status != null) where.status = condition.status

        if (condition.ids) {
            if (condition.ids.length === 0) condition.ids.push(0)
            where.id = In(condition.ids)
        }
        if (condition.distributorIds) {
            if (condition.distributorIds.length === 0) condition.distributorIds.push(0)
            where.distributorId = In(condition.distributorIds)
        }
        if (condition.statuses) {
            if (condition.statuses.length === 0) condition.statuses.push(0)
            where.status = In(condition.statuses)
        }

        if (condition.time != null) {
            if (typeof condition.time === 'number') {
                where.time = condition.time
            } else if (Array.isArray(condition.time)) {
                if (condition.time[0] === 'BETWEEN') {
                    where.time = Between(condition.time[1].getTime(), condition.time[2].getTime())
                }
            }
        }

        if (condition.deleteTime != null) {
            if (typeof condition.deleteTime === 'number') {
                where.deleteTime = condition.deleteTime
            } else if (Array.isArray(condition.deleteTime)) {
                if (condition.deleteTime[0] === 'IS_NULL') {
                    where.deleteTime = IsNull()
                }
            }
        }

        return where
    }

    async pagination(options: {
        page: number
        limit: number
        condition?: ReceiptCondition
        relation?: { distributor?: boolean; receiptItems?: boolean; distributorPayments?: boolean }
        order?: ReceiptOrder
    }) {
        const { limit, page, condition, relation, order } = options
        const where = this.getWhereOptions(condition)

        const [data, total] = await this.manager.findAndCount(Receipt, {
            relations: {
                distributor: !!relation?.distributor,
                distributorPayments: relation?.distributorPayments,
                receiptItems: relation.receiptItems ? { productBatch: { product: true } } : false,
            },
            relationLoadStrategy: 'query', // dùng join thì bị lỗi 2 câu query, bằng hòa
            where,
            order,
            take: limit,
            skip: (page - 1) * limit,
        })

        return { total, page, limit, data }
    }

    async findMany(
        condition: ReceiptCondition,
        relation?: { distributor?: boolean; receiptItems?: boolean; distributorPayments?: boolean },
        limit?: number
    ): Promise<Receipt[]> {
        const where = this.getWhereOptions(condition)

        const receipts = await this.manager.find(Receipt, {
            where,
            relations: {
                distributor: !!relation?.distributor,
                distributorPayments: relation?.distributorPayments,
                receiptItems: relation.receiptItems ? { productBatch: { product: true } } : false,
            },
            relationLoadStrategy: 'join',
            take: limit ? limit : undefined,
        })
        return receipts
    }

    async findOne(
        condition: ReceiptCondition,
        relation?: {
            distributor?: boolean
            distributorPayments?: boolean
            receiptItems?: boolean
        }
    ): Promise<Receipt> {
        const [receipt] = await this.manager.find(Receipt, {
            where: this.getWhereOptions(condition),
            relations: {
                distributor: !!relation?.distributor,
                distributorPayments: !!relation?.distributorPayments,
                receiptItems: relation.receiptItems ? { productBatch: { product: true } } : false,
            },
            relationLoadStrategy: 'join',
        })
        return receipt
    }

    async queryOneBy(
        condition: { id: number; oid: number },
        relation?: {
            distributor?: boolean
            distributorPayments?: boolean
            receiptItems?: { productBatch?: boolean }
        }
    ): Promise<Receipt> {
        let query = this.manager
            .createQueryBuilder(Receipt, 'receipt')
            .where('receipt.id = :id', { id: condition.id })
            .andWhere('receipt.oid = :oid', { oid: condition.oid })

        if (relation?.distributor) query = query.leftJoinAndSelect('receipt.distributor', 'distributor')
        if (relation?.distributorPayments) {
            query = query.leftJoinAndSelect('invoice.distributorPayments', 'distributorPayment')
        }
        if (relation?.receiptItems) query = query.leftJoinAndSelect('receipt.receiptItems', 'receiptItem')
        if (relation?.receiptItems?.productBatch) {
            query = query
                .leftJoinAndSelect('receiptItem.productBatch', 'productBatch')
                .leftJoinAndSelect('productBatch.product', 'product')
        }

        const receipt = await query.getOne()
        return receipt
    }
}
