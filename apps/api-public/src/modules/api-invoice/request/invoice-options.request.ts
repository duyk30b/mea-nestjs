import { ApiPropertyOptional } from '@nestjs/swagger'
import { valuesEnum } from '_libs/common/helpers/typescript.helper'
import { InvoiceStatus } from '_libs/database/common/variable'
import { Expose, Transform, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber } from 'class-validator'
import { SortQuery } from '../../../common/pagination.query'

export class InvoiceFilterQuery {
	@ApiPropertyOptional({ name: 'filter[customer_id]' })
	@Expose({ name: 'customer_id' })
	@Type(() => Number)
	@IsNumber()
	customerId: number

	@ApiPropertyOptional({ name: 'filter[from_time]' })
	@Expose({ name: 'from_time' })
	@Type(() => Number)
	@IsNumber()
	fromTime: number

	@ApiPropertyOptional({ name: 'filter[to_time]' })
	@Expose({ name: 'to_time' })
	@Type(() => Number)
	@IsNumber()
	toTime: number

	@ApiPropertyOptional({ name: 'filter[has_delete]' })
	@Expose({ name: 'has_delete' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	hasDelete?: boolean

	@ApiPropertyOptional({ name: 'filter[status]', enum: valuesEnum(InvoiceStatus), example: InvoiceStatus.Refund })
	@Expose({ name: 'status' })
	@Type(() => Number)
	@IsEnum(InvoiceStatus)
	status: InvoiceStatus
}

export class InvoiceRelationQuery {
	@ApiPropertyOptional({ name: 'relation[customer]' })
	@Expose({ name: 'customer' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	customer: boolean

	@ApiPropertyOptional({ name: 'relation[customer_payments]' })
	@Expose({ name: 'customer_payments' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	customerPayments: boolean

	@ApiPropertyOptional({ name: 'relation[invoice_items]' })
	@Expose({ name: 'invoice_items' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	invoiceItems: boolean
}

export class InvoiceSortQuery extends SortQuery {
}
