import { OmitType, PartialType } from '@nestjs/swagger'
import { NoExtraProperties } from '_libs/common/helpers/typescript.helper'
import { ComparisonType } from '_libs/database/common/base.dto'
import { InvoiceStatus, UnitType } from '_libs/database/common/variable'
import { Invoice, InvoiceItem } from '_libs/database/entities'
import { plainToInstance } from 'class-transformer'

export interface InvoiceCondition {
	id?: number
	oid?: number
	customerId?: number
	status?: InvoiceStatus
	arrivalId?: number

	ids?: number[]
	customerIds?: number[]
	arrivalIds?: number[]
	statuses?: InvoiceStatus[]

	createTime?: number | [ComparisonType, number, number?]
}

export type InvoiceOrder = {
	[P in 'id']?: 'ASC' | 'DESC'
}

export class InvoiceItemDto extends PartialType(OmitType(
	InvoiceItem,
	['invoiceId', 'procedure', 'productBatch', 'invoice']
)) {
	unit: UnitType
	quantity: number
	referenceId: number
}

export class InvoiceInsertDto extends PartialType(OmitType(
	Invoice,
	['oid', 'invoiceItems', 'status', 'arrivalId']
)) {
	invoiceItems: InvoiceItemDto[] = []

	/* eslint-disable */
	static from<
		T extends InvoiceInsertDto,
		K extends InvoiceItemDto,
	>(plain: NoExtraProperties<InvoiceInsertDto, T>
		& { invoiceItems?: NoExtraProperties<InvoiceItemDto, K>[] }
	): InvoiceInsertDto {
		const instance = plainToInstance(InvoiceInsertDto, plain, {
			exposeUnsetFields: false,
			excludeExtraneousValues: true,
			ignoreDecorators: true
		})

		instance.invoiceItems = (plain.invoiceItems || []).map((i) => {
			return plainToInstance(InvoiceItemDto, i, {
				exposeUnsetFields: false,
				excludeExtraneousValues: true,
				ignoreDecorators: true
			})
		})

		return instance
	}
}

export class InvoiceUpdateDto extends PartialType(OmitType(
	Invoice,
	['oid', 'invoiceItems', 'status', 'arrivalId', 'customerId']
)) {
	invoiceItems: InvoiceItemDto[] = []

	/* eslint-disable */
	static from<
		T extends InvoiceUpdateDto,
		K extends InvoiceItemDto,
	>(plain: NoExtraProperties<InvoiceUpdateDto, T>
		& { invoiceItems?: NoExtraProperties<InvoiceItemDto, K>[] }
	): InvoiceUpdateDto {
		const instance = plainToInstance(InvoiceUpdateDto, plain, {
			exposeUnsetFields: false,
			excludeExtraneousValues: true,
			ignoreDecorators: true
		})

		instance.invoiceItems = (plain.invoiceItems || []).map((i) => {
			return plainToInstance(InvoiceItemDto, i, {
				exposeUnsetFields: false,
				excludeExtraneousValues: true,
				ignoreDecorators: true
			})
		})

		return instance
	}
}

