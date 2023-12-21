import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { transformComparisonQuery } from '../../../../../_libs/common/transform-validate/class-transform.custom'
import { ComparisonType } from '../../../../../_libs/database/common/base.dto'

export class ProductBatchFilterQuery {
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

export class ProductFilterQuery {
    @ApiPropertyOptional({ type: ProductBatchFilterQuery })
    @Expose()
    @Type(() => ProductBatchFilterQuery)
    @ValidateNested({ each: true })
    productBatch: ProductBatchFilterQuery

    @ApiPropertyOptional({ name: 'filter[group]' })
    @Expose()
    @IsString()
    group: string

    @ApiPropertyOptional({ name: 'filter[searchText]' })
    @Expose()
    @IsNotEmpty()
    @IsString()
    searchText: string

    @ApiPropertyOptional({ name: 'filter[isActive]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return 1
        if (['0', 'false'].includes(value)) return 0
        return undefined
    })
    @IsIn([0, 1])
    isActive: 0 | 1

    @ApiPropertyOptional({ name: 'filter[quantity]', type: 'number', example: '["!=","0"]' })
    @Expose()
    @Transform(({ value }) => transformComparisonQuery(value, 'Number'))
    @IsArray({ message: '$property validate failed: Example: ["!=","0"]' })
    quantity: [ComparisonType, number]
}

export class ProductRelationQuery {
    @ApiPropertyOptional({ name: 'relation[productBatches]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    productBatches: boolean
}

export class ProductSortQuery extends SortQuery {
    @ApiPropertyOptional({ name: 'sort[brandName]', enum: ['ASC', 'DESC'] })
    @Expose()
    @IsIn(['ASC', 'DESC'])
    brandName: 'ASC' | 'DESC'

    @ApiPropertyOptional({ name: 'sort[quantity]', enum: ['ASC', 'DESC'] })
    @Expose()
    @IsIn(['ASC', 'DESC'])
    quantity: 'ASC' | 'DESC'
}
