import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../../../_libs/common/dto/query'
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
