import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { InvoiceFilterQuery, InvoiceRelationsQuery, InvoiceSortQuery } from './invoice-options.request'

export class InvoicePaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: InvoiceFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => InvoiceFilterQuery)
	@ValidateNested({ each: true })
	filter: InvoiceFilterQuery

	@ApiPropertyOptional({ type: InvoiceRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => InvoiceRelationsQuery)
	@ValidateNested({ each: true })
	relations: InvoiceRelationsQuery

	@ApiPropertyOptional({ type: InvoiceSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => InvoiceSortQuery)
	@ValidateNested({ each: true })
	sort: InvoiceSortQuery
}

export class InvoiceGetOneQuery {
	@ApiPropertyOptional({ type: InvoiceRelationsQuery })
	@Expose({ name: 'select' })
	@Type(() => InvoiceRelationsQuery)
	@ValidateNested({ each: true })
	relations: InvoiceRelationsQuery
}
