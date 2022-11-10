import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsNumber, ValidateNested } from 'class-validator'
import { ArrivalFilterQuery, ArrivalRelationsQuery, ArrivalSortQuery } from './arrival-options.request'

export class ArrivalPaginationQuery extends PaginationQuery {
	@ApiPropertyOptional({ type: ArrivalFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => ArrivalFilterQuery)
	@ValidateNested({ each: true })
	filter: ArrivalFilterQuery

	@ApiPropertyOptional({ type: ArrivalRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => ArrivalRelationsQuery)
	@ValidateNested({ each: true })
	relations: ArrivalRelationsQuery

	@ApiPropertyOptional({ type: ArrivalSortQuery })
	@Expose({ name: 'sort' })
	@Type(() => ArrivalSortQuery)
	@ValidateNested({ each: true })
	sort: ArrivalSortQuery
}

export class ArrivalGetManyQuery {
	@ApiPropertyOptional({ type: ArrivalFilterQuery })
	@Expose({ name: 'filter' })
	@Type(() => ArrivalFilterQuery)
	@ValidateNested({ each: true })
	filter: ArrivalFilterQuery

	@ApiPropertyOptional({ type: ArrivalRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => ArrivalRelationsQuery)
	@ValidateNested({ each: true })
	relations: ArrivalRelationsQuery
}

export class ArrivalGetOneQuery {
	@ApiPropertyOptional({ type: ArrivalRelationsQuery })
	@Expose({ name: 'relations' })
	@Type(() => ArrivalRelationsQuery)
	@ValidateNested({ each: true })
	relations: ArrivalRelationsQuery
}
