import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsInt, Max, Min, ValidateNested } from 'class-validator'
import { PurchaseFilterQuery, PurchaseRelationsQuery, PurchaseSortQuery } from './purchase-options.request'

export class PurchasePaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: PurchaseFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => PurchaseFilterQuery)
	@ValidateNested({ each: true })
	filter: PurchaseFilterQuery

	@ApiPropertyOptional({ type: PurchaseRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => PurchaseRelationsQuery)
	@ValidateNested({ each: true })
	relations: PurchaseRelationsQuery

	@ApiPropertyOptional({ type: PurchaseSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => PurchaseSortQuery)
	@ValidateNested({ each: true })
	sort: PurchaseSortQuery
}

export class PurchaseGetManyQuery {
	@ApiPropertyOptional({ name: 'limit', example: 10 })
	@Expose({ name: 'limit' })
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@Min(3)
	@Max(100)
	limit: number

	@ApiPropertyOptional({ type: PurchaseFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => PurchaseFilterQuery)
	@ValidateNested({ each: true })
	filter: PurchaseFilterQuery

	@ApiPropertyOptional({ type: PurchaseRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => PurchaseRelationsQuery)
	@ValidateNested({ each: true })
	relations: PurchaseRelationsQuery
}

export class PurchaseGetOneQuery {
	@ApiPropertyOptional({ type: PurchaseRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => PurchaseRelationsQuery)
	@ValidateNested({ each: true })
	relations: PurchaseRelationsQuery
}
