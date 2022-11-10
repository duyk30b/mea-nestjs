import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsInt, Max, Min, ValidateNested } from 'class-validator'
import { ProcedureFilterQuery, ProcedureSortQuery } from './procedure-options.request'

export class ProcedurePaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: ProcedureFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => ProcedureFilterQuery)
	@ValidateNested({ each: true })
	filter: ProcedureFilterQuery

	@ApiPropertyOptional({ type: ProcedureSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => ProcedureSortQuery)
	@ValidateNested({ each: true })
	sort: ProcedureSortQuery
}

export class ProcedureGetManyQuery {
	@ApiPropertyOptional({ name: 'limit', example: 10 })
	@Expose({ name: 'limit' })
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@Min(3)
	@Max(100)
	limit: number

	@ApiPropertyOptional({ type: ProcedureFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => ProcedureFilterQuery)
	@ValidateNested({ each: true })
	filter: ProcedureFilterQuery
}
