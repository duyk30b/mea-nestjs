import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import { CustomerFilterQuery, CustomerRelationQuery, CustomerSortQuery } from './customer-options.request'

export class CustomerGetQuery {
    @ApiPropertyOptional({ type: String, example: '{}' })
    @Expose()
    @Transform(({ value }) => {
        try {
            if (!value) return undefined // return undefined để không validate nữa
            const plain = JSON.parse(value)
            return plainToInstance(CustomerRelationQuery, plain, {
                exposeUnsetFields: false,
                excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
            })
        } catch (error) {
            return error.message
        }
    })
    @IsObject()
    @ValidateNested({ each: true })
    relation: CustomerRelationQuery

    @ApiPropertyOptional({ type: String, example: '{"isActive":1,"debt":{"GT":1500000}}' })
    @Expose()
    @Transform(({ value }) => {
        try {
            if (!value) return undefined // return undefined để không validate nữa
            const plain = JSON.parse(value)
            return plainToInstance(CustomerFilterQuery, plain, {
                exposeUnsetFields: false,
                excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
            })
        } catch (error) {
            return error.message
        }
    })
    @IsObject()
    @ValidateNested({ each: true })
    filter?: CustomerFilterQuery

    @ApiPropertyOptional({ type: String, example: '{"id":"ASC"}' })
    @Expose()
    @Transform(({ value }) => {
        try {
            if (!value) return undefined // return undefined để không validate nữa
            const plain = JSON.parse(value)
            return plainToInstance(CustomerSortQuery, plain, {
                exposeUnsetFields: false,
                excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
            })
        } catch (error) {
            return error.message
        }
    })
    @IsObject()
    @ValidateNested({ each: true })
    sort?: CustomerSortQuery
}

export class CustomerPaginationQuery extends IntersectionType(CustomerGetQuery, PaginationQuery) {}

export class CustomerGetManyQuery extends IntersectionType(
    PickType(CustomerGetQuery, ['filter', 'relation']),
    LimitQuery
) {}

export class CustomerGetOneQuery extends PickType(CustomerGetQuery, ['relation']) {}
