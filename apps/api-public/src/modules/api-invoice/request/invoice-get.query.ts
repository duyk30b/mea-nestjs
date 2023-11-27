import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsInt, ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../common/query'
import { InvoiceFilterQuery, InvoiceRelationQuery, InvoiceSortQuery } from './invoice-options.request'

export class InvoicePaginationQuery extends PaginationQuery {
    @ApiPropertyOptional({ type: InvoiceFilterQuery })
    @Expose()
    @Type(() => InvoiceFilterQuery)
    @ValidateNested({ each: true })
    filter: InvoiceFilterQuery

    @ApiPropertyOptional({ type: InvoiceRelationQuery })
    @Expose()
    @Type(() => InvoiceRelationQuery)
    @ValidateNested({ each: true })
    relation: InvoiceRelationQuery

    @ApiPropertyOptional({ type: InvoiceSortQuery })
    @Expose()
    @Type(() => InvoiceSortQuery)
    @ValidateNested({ each: true })
    sort: InvoiceSortQuery
}

export class InvoiceGetManyQuery {
    @ApiPropertyOptional({ example: 10 })
    @Expose()
    @Type(() => Number)
    @IsInt()
    limit: number

    @ApiPropertyOptional({ type: InvoiceFilterQuery })
    @Expose()
    @Type(() => InvoiceFilterQuery)
    @ValidateNested({ each: true })
    filter: InvoiceFilterQuery

    @ApiPropertyOptional({ type: InvoiceRelationQuery })
    @Expose()
    @Type(() => InvoiceRelationQuery)
    @ValidateNested({ each: true })
    relation: InvoiceRelationQuery
}

export class InvoiceGetOneQuery {
    @ApiPropertyOptional({ type: InvoiceRelationQuery })
    @Expose()
    @Type(() => InvoiceRelationQuery)
    @ValidateNested({ each: true })
    relation: InvoiceRelationQuery
}

export class InvoiceSumDebtQuery {
    @ApiPropertyOptional({ type: InvoiceFilterQuery })
    @Expose()
    @Type(() => InvoiceFilterQuery)
    @ValidateNested({ each: true })
    filter: InvoiceFilterQuery
}
