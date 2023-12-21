import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber } from 'class-validator'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { ProductMovementType } from '../../../../../_libs/database/entities/product-movement.entity'

export class ProductMovementFilterQuery {
    @ApiPropertyOptional({ name: 'filter[productId]' })
    @Expose()
    @Type(() => Number)
    @IsNumber()
    productId: number

    @ApiPropertyOptional({ name: 'filter[productBatchId]' })
    @Expose()
    @Type(() => Number)
    @IsNumber()
    productBatchId: number

    @ApiPropertyOptional({
        name: 'filter[type]',
        enum: valuesEnum(ProductMovementType),
        example: ProductMovementType.Invoice,
    })
    @Expose()
    @Type(() => Number)
    @IsEnum(ProductMovementType)
    type: ProductMovementType
}

export class ProductMovementRelationQuery {
    @ApiPropertyOptional({ name: 'relation[productBatch]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    productBatch: boolean

    @ApiPropertyOptional({ name: 'relation[invoice]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    invoice: boolean

    @ApiPropertyOptional({ name: 'relation[receipt]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    receipt: boolean
}

export class ProductMovementSortQuery extends SortQuery {}
