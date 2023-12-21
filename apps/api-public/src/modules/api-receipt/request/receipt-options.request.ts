import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsEnum, IsNumber } from 'class-validator'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { transformComparisonQuery } from '../../../../../_libs/common/transform-validate/class-transform.custom'
import { ComparisonType } from '../../../../../_libs/database/common/base.dto'
import { ReceiptStatus } from '../../../../../_libs/database/common/variable'

export class ReceiptFilterQuery {
    @ApiPropertyOptional({ name: 'filter[distributorId]' })
    @Expose()
    @Type(() => Number)
    @IsNumber()
    distributorId: number

    @ApiPropertyOptional({
        name: 'filter[time]',
        type: 'string',
        example: '[">","2023-11-12T19:12:37.355Z"]',
    })
    @Expose()
    @Transform(({ value }) => transformComparisonQuery(value, 'Date'))
    @IsArray({ message: '$property validate failed: Example: [">","2023-11-12T19:12:37.355Z"]' })
    time: [ComparisonType, Date]

    @ApiPropertyOptional({ name: 'filter[deleteTime]', type: 'string', example: '["IS_NULL"]' })
    @Expose()
    @Transform(({ value }) => transformComparisonQuery(value, 'Date'))
    @IsArray({ message: '$property validate failed: Example: ["IS_NULL"]' })
    deleteTime: [ComparisonType, Date]

    @ApiPropertyOptional({
        name: 'filter[status]',
        enum: valuesEnum(ReceiptStatus),
        example: ReceiptStatus.Draft,
    })
    @Expose()
    @Type(() => Number)
    @IsEnum(ReceiptStatus)
    status: ReceiptStatus
}

export class ReceiptRelationQuery {
    @ApiPropertyOptional({ name: 'relation[distributor]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    distributor: boolean

    @ApiPropertyOptional({ name: 'relation[distributorPayments]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    distributorPayments: boolean

    @ApiPropertyOptional({ name: 'relation[receiptItems]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    receiptItems: boolean
}

export class ReceiptSortQuery extends SortQuery {}
