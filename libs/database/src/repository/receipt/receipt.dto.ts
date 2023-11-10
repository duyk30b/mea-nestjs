import { OmitType, PartialType } from '@nestjs/swagger'
import { NoExtraProperties } from '_libs/common/helpers/typescript.helper'
import { ComparisonType } from '_libs/database/common/base.dto'
import { ReceiptStatus, UnitType } from '_libs/database/common/variable'
import { Receipt, ReceiptItem } from '_libs/database/entities'
import { plainToInstance } from 'class-transformer'

export interface ReceiptCondition {
	id?: number
	oid?: number
	distributorId?: number
	status?: ReceiptStatus

	ids?: number[]
	distributorIds?: number[]
	statuses?: ReceiptStatus[]

	fromTime?: number
	toTime?: number

	createTime?: number | [ComparisonType, number?, number?]

	deleteTime?: number | [ComparisonType, number?, number?]
}

export type ReceiptOrder = {
	[P in 'id']?: 'ASC' | 'DESC'
}
export class ReceiptItemDto extends PartialType(OmitType(
	ReceiptItem,
	['receiptId', 'receipt']
)) {
	unit: UnitType
	quantity: number
	productBatchId: number
}

export class ReceiptInsertDto extends PartialType(OmitType(
	Receipt,
	['oid', 'receiptItems', 'status', 'paid', 'debt']
)) {
	receiptItems: ReceiptItemDto[] = []

	/* eslint-disable */
	static from<
		T extends ReceiptInsertDto,
		K extends ReceiptItemDto
	>(plain: NoExtraProperties<ReceiptInsertDto, T>
		& { receiptItems?: NoExtraProperties<ReceiptItemDto, K>[] }
	): ReceiptInsertDto {
		const instance = plainToInstance(ReceiptInsertDto, plain, {
			exposeUnsetFields: false,
			excludeExtraneousValues: true,
			ignoreDecorators: true
		})

		instance.receiptItems = plain.receiptItems.map((i) => {
			return plainToInstance(ReceiptItemDto, i, {
				exposeUnsetFields: false,
				excludeExtraneousValues: true,
				ignoreDecorators: true
			})
		})
		return instance
	}
}

export class ReceiptUpdateDto extends PartialType(OmitType(
	Receipt,
	['oid', 'receiptItems', 'status', 'distributorId', 'paid', 'debt']
)) {
	receiptItems: ReceiptItemDto[] = []

	/* eslint-disable */
	static from<
		T extends ReceiptUpdateDto,
		K extends ReceiptItemDto
	>(plain: NoExtraProperties<ReceiptUpdateDto, T>
		& { receiptItems?: NoExtraProperties<ReceiptItemDto, K>[] }
	): ReceiptUpdateDto {
		const instance = plainToInstance(ReceiptUpdateDto, plain, {
			exposeUnsetFields: false,
			excludeExtraneousValues: true,
			ignoreDecorators: true
		})

		instance.receiptItems = plain.receiptItems.map((i) => {
			return plainToInstance(ReceiptItemDto, i, {
				exposeUnsetFields: false,
				excludeExtraneousValues: true,
				ignoreDecorators: true
			})
		})
		return instance
	}
}

