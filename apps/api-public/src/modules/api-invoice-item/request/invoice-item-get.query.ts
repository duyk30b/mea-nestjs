import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { InvoiceItemFilterQuery, InvoiceItemRelationsQuery, InvoiceItemSortQuery } from './invoice-item-options.request'

export class InvoiceItemPaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: InvoiceItemFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => InvoiceItemFilterQuery)
	@ValidateNested({ each: true })
	filter: InvoiceItemFilterQuery

	@ApiPropertyOptional({ type: InvoiceItemRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => InvoiceItemRelationsQuery)
	@ValidateNested({ each: true })
	relations: InvoiceItemRelationsQuery

	@ApiPropertyOptional({ type: InvoiceItemSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => InvoiceItemSortQuery)
	@ValidateNested({ each: true })
	sort: InvoiceItemSortQuery
}
