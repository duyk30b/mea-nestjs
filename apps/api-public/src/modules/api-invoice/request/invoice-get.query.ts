import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsInt, ValidateNested } from 'class-validator'
import { PaginationQuery } from '../../../common/pagination.query'
import { InvoiceFilterQuery, InvoiceRelationQuery, InvoiceSortQuery } from './invoice-options.request'

export class InvoicePaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: InvoiceFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => InvoiceFilterQuery)
	@ValidateNested({ each: true })
	filter: InvoiceFilterQuery

	@ApiPropertyOptional({ type: InvoiceRelationQuery })
	@Expose({ name: 'relation' })
	@Type(() => InvoiceRelationQuery)
	@ValidateNested({ each: true })
	relation: InvoiceRelationQuery

	@ApiPropertyOptional({ type: InvoiceSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => InvoiceSortQuery)
	@ValidateNested({ each: true })
	sort: InvoiceSortQuery
}

export class InvoiceGetManyQuery {
	@ApiPropertyOptional({ name: 'limit', example: 10 })
	@Expose({ name: 'limit' })
	@Type(() => Number)
	@IsInt()
	limit: number

	@ApiPropertyOptional({ type: InvoiceFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => InvoiceFilterQuery)
	@ValidateNested({ each: true })
	filter: InvoiceFilterQuery

	@ApiPropertyOptional({ type: InvoiceRelationQuery })
	@Expose({ name: 'relation' })
	@Type(() => InvoiceRelationQuery)
	@ValidateNested({ each: true })
	relation: InvoiceRelationQuery
}

export class InvoiceGetOneQuery {
	@ApiPropertyOptional({ type: InvoiceRelationQuery })
	@Expose({ name: 'select' })
	@Type(() => InvoiceRelationQuery)
	@ValidateNested({ each: true })
	relation: InvoiceRelationQuery
}
