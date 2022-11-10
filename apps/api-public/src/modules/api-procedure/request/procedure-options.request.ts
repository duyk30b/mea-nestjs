import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class ProcedureFilterQuery {
	@ApiPropertyOptional({ name: 'filter[search_text]' })
	@Expose({ name: 'search_text' })
	@IsNotEmpty()
	@IsString()
	searchText: string

	@ApiPropertyOptional({ name: 'filter[group]' })
	@Expose({ name: 'group' })
	@IsString()
	group: string

	@ApiPropertyOptional({ name: 'filter[is_active]' })
	@Expose({ name: 'is_active' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	isActive: boolean
}

export class ProcedureSortQuery extends SortQuery {
}
