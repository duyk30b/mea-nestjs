import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsIn, IsInt, Max, Min } from 'class-validator'

export class PaginationQuery {
	@ApiPropertyOptional({ name: 'page', example: 1 })
	@Expose({ name: 'page' })
	@Transform(({ value }) => parseInt(value)) // để không cho truyền linh tinh, ví dụ dạng chữ
	@IsInt()
	@Min(1)
	page: number

	@ApiPropertyOptional({ name: 'limit', example: 10 })
	@Expose({ name: 'limit' })
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@Min(3)
	@Max(100)
	limit: number
}

export class SortQuery {
	@ApiPropertyOptional({ name: 'sort[id]', enum: ['ASC', 'DESC'], example: 'DESC' })
	@Expose({ name: 'id' })
	@IsIn(['ASC', 'DESC'])
	id: 'ASC' | 'DESC'
}
