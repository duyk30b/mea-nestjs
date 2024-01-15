import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
    ProductBatchFilterQuery,
    ProductBatchRelationQuery,
    ProductBatchSortQuery,
} from './product-batch-options.request'

export class ProductBatchGetQuery {
    @ApiPropertyOptional({ type: String, example: '{"invoices":true}' })
    @Expose()
    @Transform(({ value }) => {
        try {
            if (!value) return undefined // return undefined để không validate nữa
            const plain = JSON.parse(value)
            return plainToInstance(ProductBatchRelationQuery, plain, {
                exposeUnsetFields: false,
                excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
            })
        } catch (error) {
            return error.message
        }
    })
    @IsObject()
    @ValidateNested({ each: true })
    relation: ProductBatchRelationQuery

    @ApiPropertyOptional({ type: String, example: '{"isActive":1,"debt":{"GT":1500000}}' })
    @Expose()
    @Transform(({ value }) => {
        try {
            if (!value) return undefined // return undefined để không validate nữa
            const plain = JSON.parse(value)
            return plainToInstance(ProductBatchFilterQuery, plain, {
                exposeUnsetFields: false,
                excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
            })
        } catch (error) {
            return error.message
        }
    })
    @IsObject()
    @ValidateNested({ each: true })
    filter?: ProductBatchFilterQuery

    @ApiPropertyOptional({ type: String, example: '{"id":"ASC"}' })
    @Expose()
    @Transform(({ value }) => {
        try {
            if (!value) return undefined // return undefined để không validate nữa
            const plain = JSON.parse(value)
            return plainToInstance(ProductBatchSortQuery, plain, {
                exposeUnsetFields: false,
                excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
            })
        } catch (error) {
            return error.message
        }
    })
    @IsObject()
    @ValidateNested({ each: true })
    sort?: ProductBatchSortQuery
}

export class ProductBatchPaginationQuery extends IntersectionType(ProductBatchGetQuery, PaginationQuery) {}

export class ProductBatchGetManyQuery extends IntersectionType(
    PickType(ProductBatchGetQuery, ['filter', 'relation']),
    LimitQuery
) {}

export class ProductBatchGetOneQuery extends PickType(ProductBatchGetQuery, ['relation']) {}
