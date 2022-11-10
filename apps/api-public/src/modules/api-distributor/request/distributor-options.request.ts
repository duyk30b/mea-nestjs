import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator'

export class DistributorFilterQuery {
	@ApiPropertyOptional({ name: 'filter[is_active]', example: false })
	@Expose({ name: 'is_active' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	isActive: boolean

	@ApiPropertyOptional({ name: 'filter[full_name_en]', example: 'Đỗ' })
	@Expose({ name: 'full_name_en' })
	@IsNotEmpty()
	@IsString()
	fullNameEn: string

	@ApiPropertyOptional({ name: 'filter[phone]', example: '09860' })
	@Expose({ name: 'phone' })
	@IsNotEmpty()
	@IsString()
	phone: string
}

export class DistributorSortQuery extends SortQuery {
	@ApiPropertyOptional({ name: 'sort[debt]', example: 'DESC' })
	@Expose({ name: 'debt' })
	@IsIn(['ASC', 'DESC'])
	debt: 'ASC' | 'DESC'

	@ApiPropertyOptional({ name: 'sort[full_name_en]', example: 'DESC' })
	@Expose({ name: 'full_name_en' })
	@IsIn(['ASC', 'DESC'])
	fullNameEn: 'ASC' | 'DESC'
}
