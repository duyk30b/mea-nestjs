import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { EntityManager, FindOptionsWhere, In, Not, Raw } from 'typeorm'
import { convertViToEn } from '../../../common/helpers/string.helper'
import { NoExtraProperties } from '../../../common/helpers/typescript.helper'
import { escapeSearch } from '../../common/base.dto'
import { Product } from '../../entities'
import { ProductCondition, ProductOrder } from './product.dto'

@Injectable()
export class ProductRepository {
    constructor(@InjectEntityManager() private manager: EntityManager) {}

    getWhereOptions(condition: ProductCondition = {}) {
        const where: FindOptionsWhere<Product> = {}

        if (condition.id != null) where.id = condition.id
        if (condition.oid != null) where.oid = condition.oid
        if (condition.group != null) where.group = condition.group
        if (condition.isActive != null) where.isActive = condition.isActive

        if (condition.ids) {
            if (condition.ids.length === 0) condition.ids.push(0)
            where.id = In(condition.ids)
        }

        if (condition.searchText) {
            const searchText = `%${escapeSearch(convertViToEn(condition.searchText))}%` // không lấy quá hạn
            where.brandName = Raw((alias) => '(brandName LIKE :searchText OR substance LIKE :searchText)', {
                searchText,
            })
        }

        if (Array.isArray(condition.quantity)) {
            if (condition.quantity[0] === '!=') {
                where.quantity = Not(condition.quantity[1])
            }
        }

        return where
    }

    async pagination<T extends Partial<ProductOrder>>(options: {
        page: number
        limit: number
        condition?: ProductCondition
        order?: NoExtraProperties<ProductOrder, T>
    }) {
        const { limit, page, condition, order } = options

        const [data, total] = await this.manager.findAndCount(Product, {
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        })

        return { total, page, limit, data }
    }

    async find(options: { limit?: number; condition?: ProductCondition; order?: ProductOrder }): Promise<Product[]> {
        const { limit, condition, order } = options

        return await this.manager.find(Product, {
            where: this.getWhereOptions(condition),
            order,
            take: limit,
        })
    }

    async findMany(condition: ProductCondition): Promise<Product[]> {
        const where = this.getWhereOptions(condition)
        return await this.manager.find(Product, { where })
    }

    async findOne(condition: ProductCondition): Promise<Product> {
        const where = this.getWhereOptions(condition)
        const [product] = await this.manager.find(Product, { where })
        return product
    }

    async insertOne<T extends Partial<Product>>(
        oid: number,
        dto: NoExtraProperties<Partial<Product>, T>
    ): Promise<Product> {
        const productEntity = this.manager.create<Product>(Product, dto)
        productEntity.oid = oid
        return this.manager.save(productEntity, { transaction: false })
    }

    async update<T extends Partial<Product>>(
        condition: ProductCondition,
        dto: NoExtraProperties<Partial<Omit<Product, 'id' | 'oid'>>, T>
    ) {
        const where = this.getWhereOptions(condition)
        return await this.manager.update(Product, where, dto)
    }

    async calculateProductQuantity(options: { oid: number; productIds: number[] }) {
        const { oid, productIds } = options
        await this.manager.query(`
            UPDATE  "Product" "product" 
            SET     "quantity" = "spb"."sumQuantity"
            FROM    ( 
                    SELECT "productId", SUM("quantity") as "sumQuantity" 
                        FROM "ProductBatch" 
                        GROUP BY "productId" 
                    ) AS "spb" 
            WHERE   "product"."id" = "spb"."productId" 
                        AND "product"."id" IN (${productIds.toString()})
                        AND "product"."oid" = ${oid}
        `)
    }
}
