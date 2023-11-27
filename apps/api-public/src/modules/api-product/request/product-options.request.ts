import { ApiPropertyOptional } from '@nestjs/swagger'
import { transformComparisonQuery } from '_libs/common/transform-validate/class-transform.custom'
import { ComparisonType } from '_libs/database/common/base.dto'
import { SortQuery } from 'apps/api-public/src/common/query'
import { Expose, Transform } from 'class-transformer'
import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator'

export class ProductFilterQuery {
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
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    isActive: boolean

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
