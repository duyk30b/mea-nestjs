import { OmitType, PartialType } from '@nestjs/swagger'
import { NoExtraProperties } from '_libs/common/helpers/typescript.helper'
import { Invoice, InvoiceItem } from '_libs/database/entities'
import { plainToInstance } from 'class-transformer'

export class InvoiceItemDto extends PartialType(OmitType(
	InvoiceItem,
	['invoiceId', 'procedure', 'productBatch', 'invoice']
)) {
	unit: string
	quantity: number
	referenceId: number
}

export class InvoiceUpsertDto extends PartialType(OmitType(
	Invoice,
	['invoiceItems', 'paymentStatus', 'paymentTime', 'arrivalId', 'customerId']
)) {
	invoiceItems: InvoiceItemDto[] = []

	/* eslint-disable */
	static from<
		T extends InvoiceUpsertDto,
		K extends InvoiceItemDto,
	>(plain: NoExtraProperties<InvoiceUpsertDto, T>
		& { invoiceItems?: NoExtraProperties<InvoiceItemDto, K>[] }
	): InvoiceUpsertDto {
		const instance = plainToInstance(InvoiceUpsertDto, plain, {
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
