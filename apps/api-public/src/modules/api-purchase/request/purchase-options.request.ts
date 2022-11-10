import { ApiPropertyOptional } from '@nestjs/swagger'
import { valuesEnum } from '_libs/common/helpers/typescript.helper'
import { PaymentStatus } from '_libs/database/common/variable'
import { SortQuery } from 'apps/api-public/src/common/pagination.query'
import { Expose, Transform, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber } from 'class-validator'

export class PurchaseFilterQuery {
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

	@ApiPropertyOptional({ name: 'filter[payment_status]', enum: valuesEnum(PaymentStatus), example: PaymentStatus.Full })
	@Expose({ name: 'payment_status' })
	@Type(() => Number)
	@IsEnum(PaymentStatus)
	paymentStatus: PaymentStatus
}

export class PurchaseRelationsQuery {
	@ApiPropertyOptional({ name: 'relations[distributor]' })
	@Expose({ name: 'distributor' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	distributor: boolean

	@ApiPropertyOptional({ name: 'relations[receipts]' })
	@Expose({ name: 'receipts' })
	@Transform(({ value }) => {
		if (['1', 'true'].includes(value)) return true
		if (['0', 'false'].includes(value)) return false
		return undefined
	})
	@IsBoolean()
	receipts: boolean
}

export class PurchaseSortQuery extends SortQuery {
}
