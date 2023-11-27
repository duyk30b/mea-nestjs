import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery } from 'apps/api-public/src/common/query'
import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { InvoiceItemFilterQuery, InvoiceItemRelationQuery, InvoiceItemSortQuery } from './invoice-item-options.request'

export class InvoiceItemPaginationQuery extends PaginationQuery {
    @ApiPropertyOptional({ type: InvoiceItemFilterQuery })
    @Expose()
    @Type(() => InvoiceItemFilterQuery)
    @ValidateNested({ each: true })
    filter: InvoiceItemFilterQuery

    @ApiPropertyOptional({ type: InvoiceItemRelationQuery })
    @Expose()
    @Type(() => InvoiceItemRelationQuery)
    @ValidateNested({ each: true })
    relation: InvoiceItemRelationQuery

    @ApiPropertyOptional({ type: InvoiceItemSortQuery })
    @Expose()
    @Type(() => InvoiceItemSortQuery)
    @ValidateNested({ each: true })
    sort: InvoiceItemSortQuery
}
