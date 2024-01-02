import { OmitType, PartialType } from '@nestjs/swagger'
import { plainToInstance } from 'class-transformer'
import { NoExtraProperties } from '../../../common/helpers/typescript.helper'
import { Invoice, InvoiceExpense, InvoiceItem, InvoiceSurcharge } from '../../entities'

export class InvoiceItemDto extends PartialType(
    OmitType(InvoiceItem, ['invoiceId', 'procedure', 'productBatch', 'invoice'])
) {
    unit: string
    quantity: number
    referenceId: number
}

export class InvoiceSurchargeDto extends PartialType(
    OmitType(InvoiceSurcharge, ['invoiceId', 'invoice', 'id', 'oid'])
) {}

export class InvoiceExpenseDto extends PartialType(OmitType(InvoiceExpense, ['invoiceId', 'invoice', 'id', 'oid'])) {}

export class InvoiceDraftInsertDto extends PartialType(
    OmitType(Invoice, [
        'oid',
        'invoiceItems',
        'invoiceSurcharges',
        'invoiceExpenses',
        'status',
        'arrivalId',
        'paid',
        'debt',
    ])
) {
    invoiceItems: InvoiceItemDto[] = []
    invoiceSurcharges: InvoiceSurchargeDto[] = []
    invoiceExpenses: InvoiceExpenseDto[] = []

    /* eslint-disable */
    static from<
        T extends InvoiceDraftInsertDto,
        K extends InvoiceItemDto,
        Q extends InvoiceSurchargeDto,
        X extends InvoiceExpenseDto,
    >(
        plain: NoExtraProperties<InvoiceDraftInsertDto, T> & {
            invoiceItems?: NoExtraProperties<InvoiceItemDto, K>[]
            invoiceSurcharges?: NoExtraProperties<InvoiceSurchargeDto, Q>[]
            invoiceExpenses?: NoExtraProperties<InvoiceExpenseDto, X>[]
        }
    ): InvoiceDraftInsertDto {
        const instance = plainToInstance(InvoiceDraftInsertDto, plain, {
            exposeUnsetFields: false,
            excludeExtraneousValues: true,
            ignoreDecorators: true,
        })

        instance.invoiceItems = (plain.invoiceItems || []).map((i) => {
            return plainToInstance(InvoiceItemDto, i, {
                exposeUnsetFields: false,
                excludeExtraneousValues: true,
                ignoreDecorators: true,
            })
        })

        instance.invoiceSurcharges = (plain.invoiceSurcharges || []).map((i) => {
            return plainToInstance(InvoiceSurchargeDto, i, {
                exposeUnsetFields: false,
                excludeExtraneousValues: true,
                ignoreDecorators: true,
            })
        })

        instance.invoiceExpenses = (plain.invoiceExpenses || []).map((i) => {
            return plainToInstance(InvoiceExpenseDto, i, {
                exposeUnsetFields: false,
                excludeExtraneousValues: true,
                ignoreDecorators: true,
            })
        })

        return instance
    }
}

export class InvoiceDraftUpdateDto extends PartialType(
    OmitType(Invoice, [
        'oid',
        'invoiceItems',
        'invoiceSurcharges',
        'invoiceExpenses',
        'status',
        'arrivalId',
        'customerId',
        'paid',
        'debt',
    ])
) {
    invoiceItems: InvoiceItemDto[] = []
    invoiceSurcharges: InvoiceSurchargeDto[] = []
    invoiceExpenses: InvoiceExpenseDto[] = []

    /* eslint-disable */
    static from<
        T extends InvoiceDraftUpdateDto,
        K extends InvoiceItemDto,
        Q extends InvoiceSurchargeDto,
        X extends InvoiceExpenseDto,
    >(
        plain: NoExtraProperties<InvoiceDraftUpdateDto, T> & {
            invoiceItems?: NoExtraProperties<InvoiceItemDto, K>[]
            invoiceSurcharges?: NoExtraProperties<InvoiceSurchargeDto, Q>[]
            invoiceExpenses?: NoExtraProperties<InvoiceExpenseDto, X>[]
        }
    ): InvoiceDraftUpdateDto {
        const instance = plainToInstance(InvoiceDraftUpdateDto, plain, {
            exposeUnsetFields: false,
            excludeExtraneousValues: true,
            ignoreDecorators: true,
        })

        instance.invoiceItems = (plain.invoiceItems || []).map((i) => {
            return plainToInstance(InvoiceItemDto, i, {
                exposeUnsetFields: false,
                excludeExtraneousValues: true,
                ignoreDecorators: true,
            })
        })

        instance.invoiceSurcharges = (plain.invoiceSurcharges || []).map((i) => {
            return plainToInstance(InvoiceSurchargeDto, i, {
                exposeUnsetFields: false,
                excludeExtraneousValues: true,
                ignoreDecorators: true,
            })
        })

        instance.invoiceExpenses = (plain.invoiceExpenses || []).map((i) => {
            return plainToInstance(InvoiceExpenseDto, i, {
                exposeUnsetFields: false,
                excludeExtraneousValues: true,
                ignoreDecorators: true,
            })
        })

        return instance
    }
}
