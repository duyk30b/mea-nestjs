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

	createTime?: number | [ComparisonType, number?, number?]

	deleteTime?: number | [ComparisonType, number?, number?]
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

export class InvoiceDraftInsertDto extends PartialType(OmitType(
	Invoice,
	['oid', 'invoiceItems', 'status', 'arrivalId', 'paid', 'debt']
)) {
	invoiceItems: InvoiceItemDto[] = []

	/* eslint-disable */
	static from<
		T extends InvoiceDraftInsertDto,
		K extends InvoiceItemDto,
	>(plain: NoExtraProperties<InvoiceDraftInsertDto, T>
		& { invoiceItems?: NoExtraProperties<InvoiceItemDto, K>[] }
	): InvoiceDraftInsertDto {
		const instance = plainToInstance(InvoiceDraftInsertDto, plain, {
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

export class InvoiceDraftUpdateDto extends PartialType(OmitType(
	Invoice,
	['oid', 'invoiceItems', 'status', 'arrivalId', 'customerId', 'paid', 'debt']
)) {
	invoiceItems: InvoiceItemDto[] = []

	/* eslint-disable */
	static from<
		T extends InvoiceDraftUpdateDto,
		K extends InvoiceItemDto,
	>(plain: NoExtraProperties<InvoiceDraftUpdateDto, T>
		& { invoiceItems?: NoExtraProperties<InvoiceItemDto, K>[] }
	): InvoiceDraftUpdateDto {
		const instance = plainToInstance(InvoiceDraftUpdateDto, plain, {
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

