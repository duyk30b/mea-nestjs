import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsIn, IsNumber } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { transformComparisonQuery } from '../../../../../_libs/common/transform-validate/class-transform.custom'
import { ComparisonType } from '../../../../../_libs/database/common/base.dto'

export class ProductBatchFilterQuery {
    @ApiPropertyOptional({ name: 'filter[productId]' })
    @Expose()
    @Type(() => Number)
    @IsNumber()
    productId: number

    @ApiPropertyOptional({ name: 'filter[quantity]', type: 'number', example: '["!=","0"]' })
    @Expose()
    @Transform(({ value }) => transformComparisonQuery(value, 'Number'))
    @IsArray({ message: '$property validate failed: Example: ["!=","0"]' })
    quantity: [ComparisonType, number]

    @ApiPropertyOptional({ name: 'filter[isActive]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return 1
        if (['0', 'false'].includes(value)) return 0
        return undefined
    })
    @IsIn([0, 1])
    isActive: 0 | 1

    @ApiPropertyOptional({
        name: 'filter[expiryDate]',
        type: 'string',
        example: '[">","2023-11-12T19:12:37.355Z"]',
    })
    @Expose()
    @Transform(({ value }) => transformComparisonQuery(value, 'Date'))
    @IsArray({ message: '$property validate failed: Example: [">","2023-11-12T19:12:37.355Z"]' })
    expiryDate: [ComparisonType, Date]
}

export class ProductBatchRelationQuery {
    @ApiPropertyOptional({ name: 'relation[product]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    product: boolean
}

export class ProductBatchSortQuery extends SortQuery {
    @ApiPropertyOptional({ name: 'sort[expiryDate]', enum: ['ASC', 'DESC'] })
    @Expose()
    @IsIn(['ASC', 'DESC'])
    expiryDate: 'ASC' | 'DESC'
}
