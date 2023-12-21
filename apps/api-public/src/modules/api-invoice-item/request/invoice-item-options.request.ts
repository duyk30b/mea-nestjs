import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber, ValidateNested } from 'class-validator'
import { objectEnum, valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { InvoiceItemType } from '../../../../../_libs/database/common/variable'

export class InvoiceItemFilterQuery {
    @ApiPropertyOptional({ name: 'filter[referenceId]' })
    @Expose()
    @Type(() => Number)
    @IsNumber()
    referenceId: number

    @ApiPropertyOptional({ name: 'filter[customerId]' })
    @Expose()
    @Type(() => Number)
    @IsNumber()
    customerId: number

    @ApiPropertyOptional({
        name: 'filter[type]',
        enum: valuesEnum(InvoiceItemType),
        description: JSON.stringify(objectEnum(InvoiceItemType)),
    })
    @Expose()
    @Type(() => Number)
    @IsEnum(InvoiceItemType)
    type: InvoiceItemType
}

// @ApiExtraModels()
export class InvoiceRelationQuery {
    @ApiPropertyOptional({ name: 'relation[invoice][customer]', enum: ['true', 'false'] })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    customer: boolean
}

export class ProductBatchRelationQuery {
    @ApiPropertyOptional({
        name: 'relation[product_batch][product]',
        enum: ['true', 'false'],
        example: 'false',
    })
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    product: boolean
}

export class InvoiceItemRelationQuery {
    @ApiPropertyOptional({ type: InvoiceRelationQuery })
    @Expose({ name: 'invoice' })
    @Type(() => InvoiceRelationQuery)
    @ValidateNested({ each: true })
    invoice: InvoiceRelationQuery

    @ApiPropertyOptional({ name: 'relation[procedure]' })
    @Expose({ name: 'procedure' })
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    procedure: boolean

    @ApiPropertyOptional({ type: ProductBatchRelationQuery })
    @Expose({ name: 'product_batch' })
    @Type(() => ProductBatchRelationQuery)
    @ValidateNested({ each: true })
    productBatch: ProductBatchRelationQuery
}

export class InvoiceItemSortQuery extends SortQuery {}
