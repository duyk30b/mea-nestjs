import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator'

export class CustomerRelationQuery {
	@ApiPropertyOptional({ name: 'relation[invoices]' })
	@Expose({ name: 'invoices' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	invoices: boolean

	@ApiPropertyOptional({ name: 'relation[customer_debts]' })
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
	@ApiPropertyOptional({ name: 'filter[is_active]', example: true })
	@Expose({ name: 'is_active' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	isActive: boolean

	@ApiPropertyOptional({ name: 'filter[full_name]' })
	@Expose({ name: 'full_name' })
	@IsNotEmpty()
	@IsString()
	fullName: string

	@ApiPropertyOptional({ name: 'filter[phone]' })
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

	@ApiPropertyOptional({ name: 'sort[full_name]', enum: ['ASC', 'DESC'], example: 'DESC' })
	@Expose({ name: 'full_name' })
	@IsIn(['ASC', 'DESC'])
	fullName: 'ASC' | 'DESC'
}
