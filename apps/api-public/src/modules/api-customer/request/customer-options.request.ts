import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsDefined, IsIn, IsNotEmpty, IsString } from 'class-validator'

export class CustomerRelationsQuery {
	@ApiPropertyOptional({ name: 'relations[invoices]' })
	@Expose({ name: 'invoices' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	invoices: boolean

	@ApiPropertyOptional({ name: 'relations[customer_debts]' })
	@Expose({ name: 'customer_debts' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	customerDebts: boolean
}

export class CustomerFilterQuery {
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

export class CustomerSortQuery extends SortQuery {
	@ApiPropertyOptional({ name: 'sort[debt]', enum: ['ASC', 'DESC'], example: 'DESC' })
	@Expose({ name: 'debt' })
	@IsIn(['ASC', 'DESC'])
	debt: 'ASC' | 'DESC'

	@ApiPropertyOptional({ name: 'sort[full_name_en]', enum: ['ASC', 'DESC'], example: 'DESC' })
	@Expose({ name: 'full_name_en' })
	@IsIn(['ASC', 'DESC'])
	fullNameEn: 'ASC' | 'DESC'
}
