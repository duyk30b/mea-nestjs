import { ApiPropertyOptional } from '@nestjs/swagger'
import { valuesEnum } from '_libs/common/helpers/typescript.helper'
import { transformComparisonQuery } from '_libs/common/transform-validate/class-transform.custom'
import { ComparisonType } from '_libs/database/common/base.dto'
import { InvoiceStatus } from '_libs/database/common/variable'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsEnum, IsNumber } from 'class-validator'
import { SortQuery } from '../../../common/query'

export class InvoiceFilterQuery {
    @ApiPropertyOptional({ name: 'filter[customerId]' })
    @Expose()
    @Type(() => Number)
    @IsNumber()
    customerId: number

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
        enum: valuesEnum(InvoiceStatus),
        example: InvoiceStatus.Refund,
    })
    @Expose()
    @Type(() => Number)
    @IsEnum(InvoiceStatus)
    status: InvoiceStatus
}

export class InvoiceRelationQuery {
    @ApiPropertyOptional({ name: 'relation[customer]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    customer: boolean

    @ApiPropertyOptional({ name: 'relation[customerPayments]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    customerPayments: boolean

    @ApiPropertyOptional({ name: 'relation[invoiceItems]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    invoiceItems: boolean

    @ApiPropertyOptional({ name: 'relation[invoiceExpenses]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    invoiceExpenses: boolean

    @ApiPropertyOptional({ name: 'relation[invoiceSurcharges]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    invoiceSurcharges: boolean
}

export class InvoiceSortQuery extends SortQuery {}
