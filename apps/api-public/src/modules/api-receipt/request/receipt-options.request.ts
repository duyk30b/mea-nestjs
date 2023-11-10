import { ApiPropertyOptional } from '@nestjs/swagger'
import { valuesEnum } from '_libs/common/helpers/typescript.helper'
import { ReceiptStatus } from '_libs/database/common/variable'
import { SortQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator'

export class ReceiptFilterQuery {
	@ApiPropertyOptional({ name: 'filter[distributor_id]' })
	@Expose({ name: 'distributor_id' })
	@Type(() => Number)
	@IsNumber()
	distributorId: number

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

	@ApiPropertyOptional({ name: 'filter[status]', enum: valuesEnum(ReceiptStatus), example: ReceiptStatus.Draft })
	@Expose({ name: 'status' })
	@Type(() => Number)
	@IsEnum(ReceiptStatus)
	status: ReceiptStatus
}

export class ReceiptRelationQuery {
	@ApiPropertyOptional({ name: 'relation[distributor]' })
	@Expose({ name: 'distributor' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	distributor: boolean

	@ApiPropertyOptional({ name: 'relation[distributor_payments]' })
	@Expose({ name: 'distributor_payments' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	distributorPayments: boolean

	@ApiPropertyOptional({ name: 'relation[receipt_items]' })
	@Expose({ name: 'receipt_items' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	receiptItems: boolean
}

export class ReceiptSortQuery extends SortQuery {
}
