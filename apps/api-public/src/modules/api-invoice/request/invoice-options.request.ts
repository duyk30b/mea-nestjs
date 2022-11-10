import { ApiPropertyOptional } from '@nestjs/swagger'
import { valuesEnum } from '_libs/common/helpers/typescript.helper'
import { PaymentStatus } from '_libs/database/common/variable'
import { SortQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber } from 'class-validator'

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

	@ApiPropertyOptional({ name: 'filter[payment_status]', enum: valuesEnum(PaymentStatus), example: PaymentStatus.Full })
	@Expose({ name: 'payment_status' })
	@Type(() => Number)
	@IsEnum(PaymentStatus)
	paymentStatus: PaymentStatus
}

export class InvoiceRelationsQuery {
	@ApiPropertyOptional({ name: 'relations[customer]' })
	@Expose({ name: 'customer' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	customer: boolean

	@ApiPropertyOptional({ name: 'relations[invoice_items]' })
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
