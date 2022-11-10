import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { ReceiptFilterQuery, ReceiptRelationsQuery, ReceiptSortQuery } from './receipt-options.request'

export class ReceiptPaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: ReceiptFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => ReceiptFilterQuery)
	@ValidateNested({ each: true })
	filter: ReceiptFilterQuery

	@ApiPropertyOptional({ type: ReceiptRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => ReceiptRelationsQuery)
	@ValidateNested({ each: true })
	relations: ReceiptRelationsQuery

	@ApiPropertyOptional({ type: ReceiptSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => ReceiptSortQuery)
	@ValidateNested({ each: true })
	sort: ReceiptSortQuery
}

export class ReceiptGetOneQuery {
	@ApiPropertyOptional({ type: ReceiptRelationsQuery })
	@Expose({ name: 'select' })
	@Type(() => ReceiptRelationsQuery)
	@ValidateNested({ each: true })
	relations: ReceiptRelationsQuery
}
